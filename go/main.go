package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/jspark2000/go-study-week2/go/post"
	"github.com/jspark2000/go-study-week2/go/rabbitmq"
)

var producer rabbitmq.Producer
var consumer rabbitmq.Consumer

func main() {
	producerConfig := rabbitmq.ProducerConfig{
		AmqpURI:        "amqp://skkuding:1234@localhost:5672/",
		ConnectionName: "ProducerConnection",
		ExchangeName:   "post.exchange",
		RoutingKey:     "post.result",
	}

	consumerConfig := rabbitmq.ConsumerConfig{
		AmqpURI:        "amqp://skkuding:1234@localhost:5672/",
		ConnectionName: "ConsumerConnection",
		QueueName:      "post.q.submission",
		Ctag:           "post_consumer",
	}

	var err error
	producer, err = rabbitmq.NewProducer(producerConfig)
	if err != nil {
		log.Fatalf("Failed to create producer: %s", err)
	}

	err = producer.OpenChannel()
	if err != nil {
		log.Fatalf("Failed to open producer channel: %s", err)
	}

	consumer, err = rabbitmq.NewConsumer(consumerConfig)
	if err != nil {
		log.Fatalf("Failed to create consumer: %s", err)
	}

	err = consumer.OpenChannel()
	if err != nil {
		log.Fatalf("Failed to open consumer channel: %s", err)
	}

	messages, err := consumer.Subscribe()
	if err != nil {
		log.Fatalf("Failed to subscribe to queue: %s", err)
	}

	go func() {
		for d := range messages {
			log.Printf("Received a message: %s", d.Body)
			d.Ack(false)

			newMessage := post.ProcessPost(d.Body)
			ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)

			defer cancel()

			err := producer.Publish(newMessage, ctx)

			if err != nil {
				log.Printf("Failed to publish new message: %s", err)
			}
		}
	}()

	log.Println("Server is running on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
