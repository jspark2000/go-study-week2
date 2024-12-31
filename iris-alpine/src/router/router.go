package router

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/jspark2000/go-study-week2/iris-alpine/src/judger"
	"github.com/jspark2000/go-study-week2/iris-alpine/src/loader"
	"github.com/jspark2000/go-study-week2/iris-alpine/src/loader/postgres"
	"github.com/jspark2000/go-study-week2/iris-alpine/src/rabbitmq"
)

type JudgeRequestMessage struct {
	Id        int    `json:"id"`
	Code      string `json:"code"`
	ProblemId int    `json:"problemId"`
}

type JudgeResultMessage struct {
	Result       int `json:"result"`
	TestcaseId   int `json:"testcaseId"`
	SubmissionId int `json:"submissionId"`
}

type JudgeRouter interface {
	HandleJudge()
}

type BasicJudgeRouter struct {
	judger   judger.Judger
	loader   loader.Read
	producer rabbitmq.Producer
}

func NewBasicJudgeRouter(producer rabbitmq.Producer) *BasicJudgeRouter {
	judger := judger.NewBasicJudger()
	loader := postgres.NewPostgresDataSource()

	return &BasicJudgeRouter{judger: &judger, loader: loader, producer: producer}
}

func (b *BasicJudgeRouter) HandleJudge(body []byte, out chan string) {
	var message JudgeRequestMessage

	err := json.Unmarshal([]byte(body), &message)

	if err != nil {
		log.Fatal(err)
	}

	testcases, err := b.loader.Get(fmt.Sprint(message.ProblemId))

	if err != nil {
		log.Fatal(err)
	}

	judgeChan := make(chan judger.JudgeResult)

	go b.judger.Judge(message.Code, testcases, judgeChan)

	for result := range judgeChan {
		// TODO: judgeChan 채널로 부터 오는 채점 결과들을 받아 메세지큐에 전달하는 코드 작성
		// Hint: b.producer.Publish()  활용
	}

	// 모든 테스트케이스 채점이 끝났다고 out 채널로 알림
	out <- "finish"
}
