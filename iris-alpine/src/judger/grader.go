package judger

import "bytes"

type Grader interface {
	CheckAnswer(target []byte, answer []byte) int
}

const (
	ResultAccept = iota // 0
	WrongAnswer         // 1
	CompileError        // 2
	SystemError         // 3
)

type BasicGrader struct{}

func NewBasicGrader() BasicGrader {
	return BasicGrader{}
}

func (b *BasicGrader) CheckAnswer(target []byte, answer []byte) int {
	isEqual := bytes.Equal(target, answer)

	if isEqual {
		return ResultAccept
	} else {
		return WrongAnswer
	}
}
