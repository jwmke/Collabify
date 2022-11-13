package main

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
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
// [✔️] 1. When post endpoint is called, create hashmap of artists
// [❌] 2. for each artist start a goroutine, in the routine: Retrieve all albums w/ Query 'include_groups':'appears_on'
// [❌] 3. check if any artists in ownership of album are included in artist hashmap
// [❌] 4. if yes, iterate through album to find song that contains collaberation between both artists and append to return list
// [❌] 5. concatinate return lists from all goroutines into single list, ensuring to remove duplicates
// [❌] 6. return single list to frontend

func getCollabs(c *gin.Context) {
	var artistIds []ID
	body, err := ioutil.ReadAll(c.Request.Body)
	if err != nil {
		c.AbortWithError(400, err)
		return
	}

	err = json.Unmarshal(body, &artistIds)
	if err != nil {
		c.AbortWithError(400, err)
		return
	}

	artistIdMap := make(map[ID]bool)
	for _, id := range artistIds {
		artistIdMap[id] = true
	}

	c.JSON(http.StatusOK, gin.H{
		"message": string(artistIds[1]),
	})
}

func main() {
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://127.0.0.1"},
		AllowMethods:     []string{"POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		AllowAllOrigins:  false,
		AllowOriginFunc:  func(origin string) bool { return true },
		MaxAge:           12 * time.Hour,
	}))
	r.POST("/collabs", getCollabs)
	r.Run()
}
