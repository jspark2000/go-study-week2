package rabbitmq

import (
	"fmt"

	amqp "github.com/rabbitmq/amqp091-go"
)

type Consumer interface {
	OpenChannel() error
	Subscribe() (<-chan amqp.Delivery, error)
	CleanUp() error
}

type consumer struct {
	connection *amqp.Connection
	channel    *amqp.Channel
	queueName  string
	tag        string
	Done       chan error
}

type ConsumerConfig struct {
	AmqpURI        string
	ConnectionName string
	QueueName      string
	Ctag           string
}

func NewConsumer(config ConsumerConfig) (*consumer, error) {

	// Create New RabbitMQ Connection (go <-> RabbitMQ)
	amqpConfig := amqp.Config{Properties: amqp.NewConnectionProperties()}
	amqpConfig.Properties.SetClientConnectionName(config.ConnectionName)
	connection, err := amqp.DialConfig(config.AmqpURI, amqpConfig)
	if err != nil {
		return nil, fmt.Errorf("consumer: dial failed: %w", err)
	}

	return &consumer{
		connection: connection,
		channel:    nil,
		queueName:  config.QueueName,
		tag:        config.Ctag,
		Done:       make(chan error),
	}, nil
}

func (c *consumer) OpenChannel() error {
	var err error

	if c.channel, err = c.connection.Channel(); err != nil {
		return fmt.Errorf("channel: %s", err)
	}

	if err = c.channel.Qos(
		1,
		0,
		false,
	); err != nil {
		return fmt.Errorf("qos set: %s", err)
	}
	return nil
}

func (c *consumer) Subscribe() (<-chan amqp.Delivery, error) {

	messages, err := c.channel.Consume(
		c.queueName, // queue name
		c.tag,       // consumer
		false,       // autoAck
		false,       // exclusive
		false,       // noLocal
		false,       // noWait
		nil,         // arguments
	)

	if err != nil {
		return nil, fmt.Errorf("queue consume: %s", err)
	}

	return messages, nil
}

func (c *consumer) CleanUp() error {
	if err := c.channel.Cancel(c.tag, true); err != nil {
		return fmt.Errorf("Consumer cancel failed: %w", err)
	}

	if err := c.connection.Close(); err != nil {
		return fmt.Errorf("AMQP connection close error: %s", err)
	}
	defer fmt.Println("RabbitMQ connection clear done")

	return <-c.Done
}
