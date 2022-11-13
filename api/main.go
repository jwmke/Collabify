package main

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type collabReq struct {
	Token   string `json:"token"`
	Artists []ID   `json:"artists"`
}

//TODO
// [✔️] 1. When post endpoint is called, create hashmap of artists
// [❌] 2. for each artist start a goroutine, in the routine: Retrieve all albums w/ Query 'include_groups':'appears_on'
// [❌] 3. check if any artists in ownership of album are included in artist hashmap
// [❌] 4. if yes, iterate through album to find song that contains collaberation between both artists and append to return list
// [❌] 5. concatinate return lists from all goroutines into single list, ensuring to remove duplicates
// [❌] 6. return single list to frontend

func sendGetCollabs(c *gin.Context) {
	var request collabReq
	body, err := ioutil.ReadAll(c.Request.Body)
	if err != nil {
		c.AbortWithError(400, err)
		return
	}

	err = json.Unmarshal(body, &request)
	if err != nil {
		c.AbortWithError(400, err)
		return
	}

	trackIds := getCollabs(request)
	jsonTrackIds, _ := json.Marshal(trackIds)

	c.JSON(http.StatusOK, gin.H{
		"trackIds": jsonTrackIds,
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
	r.POST("/collabs", sendGetCollabs)
	r.Run()
}
