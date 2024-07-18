package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/jspark2000/go-study-week2/go/post"
	"github.com/jspark2000/go-study-week2/go/rabbitmq"
)

var producer rabbitmq.Producer
var consumer rabbitmq.Consumer

func main() {
	producerConfig := rabbitmq.ProducerConfig{
		AmqpURI:        "amqp://skkuding:1234@localhost:5672/vh",
		ConnectionName: "ProducerConnection",
		ExchangeName:   "post.exchange",
		RoutingKey:     "post.result",
	}

	consumerConfig := rabbitmq.ConsumerConfig{
		AmqpURI:        "amqp://skkuding:1234@localhost:5672/vh",
		ConnectionName: "ConsumerConnection",
		QueueName:      "post.q.submission",
		Ctag:           "post_consumer",
	}

	producer, err := rabbitmq.NewProducer(producerConfig)
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
			d.Ack(false)

			var post post.ConsumedPost

			err := json.Unmarshal([]byte(d.Body), &post)

			if err != nil {
				log.Fatal(err)
			}

			fmt.Println(post)

			// result := post.ProcessPost(post)
			// ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)

			// message, err := json.Marshal(result)

			// if err != nil {
			// 	log.Fatal(err)
			// }

			// defer cancel()

			// err = producer.Publish(message, ctx)

			// if err != nil {
			// 	log.Printf("Failed to publish new message: %s", err)
			// }
		}
	}()

	log.Println("Server is running on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
