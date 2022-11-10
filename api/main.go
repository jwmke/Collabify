package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Artist struct {
	Name         string            `json:"name"`
	ID           ID                `json:"id"`
	URI          URI               `json:"uri"`
	Endpoint     string            `json:"href"`
	ExternalURLs map[string]string `json:"external_urls"`
	Popularity   int               `json:"popularity"`
	Genres       []string          `json:"genres"`
	Followers    Followers         `json:"followers"`
	Images       []Image           `json:"images"`
}

//TODO
// 1. Create hashmap of artists
// 2. for each artist start a goroutine, in the routine: Retrieve all albums w/ Query 'include_groups':'appears_on'
// 3. check if any artists in ownership of album are included in artist hashmap
// 4. if yes, iterate through album to find song that contains collaberation between both artists and append to return list
// 5. concatinate return lists from all goroutines into single list, ensuring to remove duplicates
// 6. return single list to frontend

func main() {
	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})
	r.Run()
}
