package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/handlers"
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
)

func WsEndpoint(w http.ResponseWriter, r *http.Request) {

	wsUpgrader.CheckOrigin = func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		return origin == "http://127.0.0.1:3000" // Change before deployment
	}

	wsConn, err := wsUpgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Printf("Could not upgrade: %v\n", err.Error())
		return
	}

	defer wsConn.Close()

	for {
		var req collabReq

		err := wsConn.ReadJSON(&req)
		if err != nil {
			fmt.Printf("Error reading request: %v\n", err.Error())
			break
		}
		// todo ensure same func can't run at twice at same time
		getCollabs(req, wsConn)
	}
}

func main() {
	router := mux.NewRouter()

	router.HandleFunc("/socket", WsEndpoint)

	headersOk := handlers.AllowedHeaders([]string{"Origin", "Content-Length", "Content-Type"})
	originsOk := handlers.AllowedOrigins([]string{"http://127.0.0.1:3000"}) // Change before deployment
	methodsOk := handlers.AllowedMethods([]string{"POST", "OPTIONS"})
	exposeHeaders := handlers.ExposedHeaders([]string{"Content-Length"})

	log.Fatal(http.ListenAndServe(":8080", handlers.CORS(originsOk, headersOk, methodsOk, exposeHeaders)(router)))
}
