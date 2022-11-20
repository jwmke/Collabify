package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

type collabReq struct {
	Token   string `json:"token"`
	Artists []ID   `json:"artists"`
}

type Connection struct {
	Socket *websocket.Conn
	mu     sync.Mutex
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

	var sockets = make(map[string]*Connection)

	for {
		var req collabReq

		err := wsConn.ReadJSON(&req)
		if err != nil {
			fmt.Printf("Error reading request: %v\n", err.Error())
			break
		}
		if sockets[req.Token] == nil {
			connection := new(Connection)
			connection.Socket = wsConn
			sockets[req.Token] = connection
		}
		for _, connection := range sockets {
			getCollabs(req, connection)
		}
	}
}

func (c *Connection) Send(returnTrack TrackResp) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.Socket.WriteJSON(returnTrack)
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
