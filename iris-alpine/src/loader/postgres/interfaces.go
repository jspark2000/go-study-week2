package postgres

import "github.com/jspark2000/go-study-week2/iris-alpine/src/loader"

type PostgresDataSource interface {
	loader.Read
}
