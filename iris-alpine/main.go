package main

import (
	"log"

	"github.com/jspark2000/go-study-week2/iris-alpine/src/rabbitmq"
	"github.com/jspark2000/go-study-week2/iris-alpine/src/router"
)

var consumer rabbitmq.Consumer
var producer rabbitmq.Producer
var err error

func main() {
	producerConfig := rabbitmq.ProducerConfig{
		AmqpURI:        "amqp://skkuding:1234@localhost:5672/vh",
		ConnectionName: "ProducerConnection",
		ExchangeName:   "submission.exchange",
		RoutingKey:     "judge.result",
	}

	consumerConfig := rabbitmq.ConsumerConfig{
		AmqpURI:        "amqp://skkuding:1234@localhost:5672/vh",
		ConnectionName: "ConsumerConnection",
		QueueName:      "judge.q.submission",
		Ctag:           "judge_consumer",
	}

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

	router := router.NewBasicJudgeRouter(producer)

	go func() {
		// 채점 요청 메세지 처리
		for judgeRequest := range messages {
			out := make(chan string)
			go router.HandleJudge([]byte(judgeRequest.Body), out)

			// 채점 완료시까지 대기
			<-out
			close(out)

			// 채점 요청 메세지 Ack
			judgeRequest.Ack(false)
		}
	}()

	log.Println("Server is running now...")

	// 메인 함수 종료 방지 (코드당 - Iris 코드보면 실제로 이렇게 구현함)
	select {}
}
