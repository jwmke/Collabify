package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

type collabReq struct {
	Token   string `json:"token"`
	Artists []ID   `json:"artists"`
}

var (
	wsUpgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}

	wsConn *websocket.Conn
)

func WsEndpoint(w http.ResponseWriter, r *http.Request) {

	channel := make(chan ID)

	wsUpgrader.CheckOrigin = func(r *http.Request) bool {
		return true
		// 	AllowOrigins:     []string{"http://127.0.0.1"},
		// 	AllowMethods:     []string{"POST", "OPTIONS"},
		// 	AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type"},
		// 	ExposeHeaders:    []string{"Content-Length"},
		// 	AllowCredentials: true,
		// 	AllowAllOrigins:  false,
		// 	AllowOriginFunc:  func(origin string) bool { return true },
		// 	MaxAge:           12 * time.Hour,
	}

	wsConn, err := wsUpgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Printf("Could not upgrade: %v\n", err.Error())
		return
	}

	defer wsConn.Close()

	gettingColabs := false

	for {
		var req collabReq

		err := wsConn.ReadJSON(&req)
		if err != nil {
			fmt.Printf("Error reading request: %v\n", err.Error())
			break
		}

		// TODO: investigate
		if !gettingColabs {
			go getCollabs(req, channel)
		}
		id := <-channel
		sendID(id)
	}
}

func sendID(id ID) {
	err := wsConn.WriteMessage(websocket.TextMessage, []byte(id))
	if err != nil {
		fmt.Printf("Error sending message: %v\n", err.Error())
	}
}

func main() {
	router := mux.NewRouter()

	router.HandleFunc("/socket", WsEndpoint)

	log.Fatal(http.ListenAndServe(":8080", router))
}
