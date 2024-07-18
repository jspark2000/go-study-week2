package post

import "fmt"

func ProcessPost(body []byte) []byte {
	processedMessage := fmt.Sprintf("Processed: %s", body)
	return []byte(processedMessage)
}
