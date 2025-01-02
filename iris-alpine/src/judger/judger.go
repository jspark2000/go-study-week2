package judger

import (
	"bytes"
	"fmt"
	"log"
	"os"
	"os/exec"

	"github.com/google/uuid"
	"github.com/jspark2000/go-study-week2/iris-alpine/src/loader"
)

type JudgeResult struct {
	Result     int `json:"result"`
	TestcaseId int `json:"testcaseId"`
}

type Judger interface {
	Judge(code string, testcases []loader.Element, judgeChan chan JudgeResult)
}

type BasicJudger struct {
	grader Grader
}

func NewBasicJudger() BasicJudger {
	grader := NewBasicGrader()
	return BasicJudger{grader: &grader}
}

func (b *BasicJudger) Judge(code string, testcases []loader.Element, judgeChan chan JudgeResult) {
	uuidStr := uuid.New().String()
	cFileName := fmt.Sprintf("user_code_%s.c", uuidStr)
	outputFileName := fmt.Sprintf("user_program_%s", uuidStr)

	err := os.WriteFile(cFileName, []byte(code), 0644)
	if err != nil {
		judgeChan <- JudgeResult{
			Result: SystemError,
		}
		log.Printf("C 코드 파일 저장 실패: %v", err)

		return
	}

	defer func() {
		if err := os.Remove(cFileName); err != nil {
			log.Printf("C 코드 파일 삭제 실패: %v", err)
		}
		if err := os.Remove(outputFileName); err != nil {
			log.Printf("실행 파일 삭제 실패: %v", err)
		}

		// 채널을 닫아 모든 테스트 케이스 채점이 끝났다는 것을 router에게 알림
		close(judgeChan)
	}()

	// gcc로 컴파일
	cmd := exec.Command("gcc", cFileName, "-o", outputFileName)

	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("gcc 컴파일 실패: %v\n%s", err, string(output))

		judgeChan <- JudgeResult{
			Result: CompileError,
		}
		return
	}

	for _, testcase := range testcases {
		execCmd := exec.Command("./" + outputFileName)

		// 표준 입력으로 testcase.In 내용 전달
		execCmd.Stdin = bytes.NewBufferString(testcase.In)
		execOutput, err := execCmd.CombinedOutput()

		if err != nil {
			log.Printf("코드 실행 실패: %v\n%s", err, string(execOutput))
			judgeChan <- JudgeResult{
				Result: SystemError,
			}
			return
		}

		// TODO: 정답여부 검사 후 judgeResult 채널로 결과 전송하기
		// Hint: b.grader 활용 (1차 실습과 달리 grader 메서드는 구현되어있음)
	}

	// 채널을 닫아 모든 테스트 케이스 채점이 끝났다는 것을 router에게 알림
	close(judgeChan)
}
