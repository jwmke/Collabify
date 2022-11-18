package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/gin-gonic/gin"
	socketio "github.com/googollee/go-socket.io"
)

type collabReq struct {
	Token   string `json:"token"`
	Artists []ID   `json:"artists"`
}

func GinMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://127.0.0.1")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Length, Content-Type")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "Content-Length")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Request.Header.Del("Origin")

		c.Next()
	}
}

// 1. When post endpoint is called, create hashmap of artists
// 2. for each artist start a goroutine, in the routine: Retrieve all albums
// 3. check if any artists in ownership of album are included in artist hashmap
// 4. if yes, iterate through album to find song that contains collaberation between both artists and append to return list
// 5. concatinate return lists from all goroutines into single list, ensuring to remove duplicates
// 6. return single list to frontend

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
	router := gin.New()
	server := socketio.NewServer(nil)

	server.OnConnect("/", func(s socketio.Conn) error {
		s.SetContext("")
		fmt.Println("connected:", s.ID())
		return nil
	})

	server.OnEvent("/", "getCollabs", func(s socketio.Conn, params string) {
		fmt.Println("Getting collabs for", params)
		// s.Emit()
	})

	server.OnEvent("/", "disconnect", func(s socketio.Conn) string {
		last := s.Context().(string)
		s.Close()
		return last
	})

	server.OnError("/", func(s socketio.Conn, e error) {
		fmt.Println("error:", e)
	})

	server.OnDisconnect("/", func(s socketio.Conn, msg string) {
		fmt.Println("closed", msg)
	})

	go func() {
		if err := server.Serve(); err != nil {
			fmt.Printf("socketio listen error: %s\n", err)
		}
	}()
	defer server.Close()

	router.Use(GinMiddleware())
	router.GET("/socket.io/*any", gin.WrapH(server))
	router.POST("/socket.io/*any", gin.WrapH(server))
	// router.POST("/collabs", sendGetCollabs)
	if err := router.Run(":8080"); err != nil {
		fmt.Printf("failed run app: %v\n", err)
	}
}
