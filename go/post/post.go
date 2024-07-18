package post

type ConsumedPost struct {
	Id      int    `json:"id"`
	Title   string `json:"title"`
	Content string `json:"content"`
}

type ProducedPost struct {
	Id     int    `json:"id"`
	Status string `json:"status"`
}
