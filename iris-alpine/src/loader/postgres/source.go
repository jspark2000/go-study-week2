package postgres

import (
	"database/sql"
	"fmt"
	"os"
	"strings"

	"github.com/jspark2000/go-study-week2/iris-alpine/src/loader"
	_ "github.com/lib/pq"
)

type postgres struct {
	client *sql.DB
}

func NewPostgresDataSource() *postgres {
	connStr := os.Getenv("DATABASE_URL")
	data := strings.Replace(connStr, "schema=public", "sslmode=disable", 1)
	db, err := sql.Open("postgres", data)

	if err != nil {
		panic(fmt.Errorf("cannot access database: %w", err))
	}

	return &postgres{db}
}

func (p *postgres) Get(key string) ([]loader.Element, error) {
	rows, err := p.client.Query(`SELECT id, input, output FROM public.testcase WHERE problem_id = $1`, key)
	if err != nil {
		return nil, fmt.Errorf("failed to get key: %w", err)
	}

	defer rows.Close()

	var result []loader.Element

	for rows.Next() {
		var id int
		var input string
		var output string

		if err := rows.Scan(&id, &input, &output); err != nil {
			return nil, fmt.Errorf("database fetch error: %w", err)
		}

		result = append(result, loader.Element{
			Id:  id,
			In:  input,
			Out: output,
		})
	}

	if len(result) == 0 {
		return nil, fmt.Errorf("no testcase found for problemId: %s", key)
	}

	return result, nil
}
