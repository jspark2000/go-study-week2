package post

import (
	"strings"
)

// TODO
// post.title에 특정 단어 있는지 검사 후 결과 반환하기

func ProcessPost(post ConsumedPost) *ProducedPost {
  badWords := []string{"스꾸딩싫어", "고랭싫어"}

  for _, badWord := range badWords {
    if strings.Contains(post.Title, badWord) || strings.Contains(post.Content, badWord) {
      return NewProducedPost(post.Id, "Failed")
    }
  }
  return NewProducedPost(post.Id, "Success")
}
