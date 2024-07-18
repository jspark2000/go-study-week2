package post

type PostStatus int

const (
  Processing PostStatus = iota
  Success
  Failed
)
