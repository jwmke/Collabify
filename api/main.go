package main

import (
	"io/ioutil"
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
// 1. When post endpoint is called, create hashmap of artists
// 2. for each artist start a goroutine, in the routine: Retrieve all albums w/ Query 'include_groups':'appears_on'
// 3. check if any artists in ownership of album are included in artist hashmap
// 4. if yes, iterate through album to find song that contains collaberation between both artists and append to return list
// 5. concatinate return lists from all goroutines into single list, ensuring to remove duplicates
// 6. return single list to frontend

func getCollabs(c *gin.Context) {
	body := c.Request.Body
	artists, err := ioutil.ReadAll(body)
	if err != nil {
		c.JSON(http.StatusBadRequest, "")
	}
	c.JSON(http.StatusOK, gin.H{
		"message": string(artists),
	})
}

func main() {
	r := gin.Default()
	r.POST("/collabs", getCollabs)
	r.Run()
}
