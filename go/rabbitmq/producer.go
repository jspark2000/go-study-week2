package rabbitmq

import (
	"context"
	"fmt"

	amqp "github.com/rabbitmq/amqp091-go"
)

type Producer interface {
	OpenChannel() error
	Publish([]byte, context.Context) error
	CleanUp() error
}

type producer struct {
	connection   *amqp.Connection
	channel      *amqp.Channel
	exchangeName string
	routingKey   string
	Done         chan error
	publishes    chan uint64
}

type ProducerConfig struct {
	AmqpURI        string
	ConnectionName string
	ExchangeName   string
	RoutingKey     string
}

func NewProducer(config ProducerConfig) (*producer, error) {

	// Create New RabbitMQ Connection (go <-> RabbitMQ)
	amqpConfig := amqp.Config{Properties: amqp.NewConnectionProperties()}
	amqpConfig.Properties.SetClientConnectionName(config.ConnectionName)
	connection, err := amqp.DialConfig(config.AmqpURI, amqpConfig)
	if err != nil {
		return nil, fmt.Errorf("consumer: dial failed: %w", err)
	}

	return &producer{
		connection:   connection,
		channel:      nil,
		exchangeName: config.ExchangeName,
		routingKey:   config.RoutingKey,
		Done:         make(chan error),
		publishes:    make(chan uint64, 8),
	}, nil
}

func (p *producer) OpenChannel() error {
	var err error

	if p.channel, err = p.connection.Channel(); err != nil {
		return fmt.Errorf("channel: %s", err)
	}

	if err := p.channel.Confirm(false); err != nil {
		return fmt.Errorf("channel could not be put into confirm mode: %s", err)
	}

	confirms := p.channel.NotifyPublish(make(chan amqp.Confirmation, 10))

	go p.confirmHandler(confirms)

	return nil
}

func (p *producer) confirmHandler(confirms chan amqp.Confirmation) {
	m := make(map[uint64]bool)
	for {
		select {
		case <-p.Done:
			fmt.Println("confirmHandler is stopping")
			return
		case publishSeqNo := <-p.publishes:
			// log.Printf("waiting for confirmation of %d", publishSeqNo)
			m[publishSeqNo] = false
		case confirmed := <-confirms:
			if confirmed.DeliveryTag > 0 {
				if confirmed.Ack {
					fmt.Printf("confirmed delivery with delivery tag: %d", confirmed.DeliveryTag)
				} else {
					fmt.Printf("failed delivery of delivery tag: %d", confirmed.DeliveryTag)
				}
				delete(m, confirmed.DeliveryTag)
			} else {
				fmt.Printf("delivery tag must be a positive integer value: received: %d", confirmed.DeliveryTag)
				panic("Invalid Delivery Tag: There might be an issue with the connection to the RabbitMQ broker")
			}
		}
	}
}

func (p *producer) Publish(result []byte, ctx context.Context) error {

	seqNo := p.channel.GetNextPublishSeqNo()
	fmt.Printf("Publishing %dB body", len(result))
	fmt.Println(string(result))

	if err := p.channel.PublishWithContext(ctx,
		p.exchangeName, // publish to an exchange
		p.routingKey,   // routing to 0 or more queues
		false,          // mandatory
		false,          // immediate
		amqp.Publishing{
			Headers:         amqp.Table{},
			ContentType:     "application/json",
			ContentEncoding: "",
			Body:            result,
			DeliveryMode:    amqp.Persistent, // 1=non-persistent, 2=persistent
			Priority:        0,               // 0-9
		},
	); err != nil {
		return fmt.Errorf("exchange publish: %s", err)
	}

	fmt.Printf("published %dB OK", len(result))
	p.publishes <- seqNo

	return nil
}

func (p *producer) CleanUp() error {
	if err := p.channel.Close(); err != nil {
		return fmt.Errorf("channel close failed: %s", err)
	}

	if err := p.connection.Close(); err != nil {
		return fmt.Errorf("connection close error: %s", err)
	}

	return <-p.Done
}
