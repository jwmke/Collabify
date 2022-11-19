package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type AlbumsReq struct {
	Href     string        `json:"href"`
	Items    []SimpleAlbum `json:"items"`
	Limit    int           `json:"limit"`
	Next     *string       `json:"next"`
	Offset   int           `json:"offset"`
	Previous *string       `json:"previous"`
	Total    int           `json:"total"`
}

type TracksReq struct {
	Href     string        `json:"href"`
	Items    []SimpleTrack `json:"items"`
	Limit    int           `json:"limit"`
	Next     *string       `json:"next"`
	Offset   int           `json:"offset"`
	Previous *string       `json:"previous"`
	Total    int           `json:"total"`
}

type TrackResp struct {
	Id      ID             `json:"id"`
	Artists []SimpleArtist `json:"artists"`
	Name    string         `json:"name"`
}

func getCollabs(request collabReq, wsConn *websocket.Conn) {
	token := request.Token
	artistIds := request.Artists
	fmt.Println("Getting collabs") // TODO delete later
	artistIdMap := make(map[ID]bool)
	for _, id := range artistIds {
		artistIdMap[id] = true
	}

	var wg sync.WaitGroup
	wg.Add(len(artistIds))
	for _, id := range artistIds {
		go artistCollabs(&wg, id, artistIdMap, token, wsConn)
	}

	wg.Wait()
}

func artistCollabs(wg *sync.WaitGroup, artistId ID, idMap map[ID]bool, token string, wsConn *websocket.Conn) {
	defer wg.Done()
	client := &http.Client{}
	albumUrl := fmt.Sprintf("https://api.spotify.com/v1/artists/%s/albums?include_groups=single%%2Calbum&market=US&limit=50", artistId)
	continueFlag := true
	var albumIds []ID
	for continueFlag {
		req, _ := http.NewRequest("GET", albumUrl, nil)
		req.Header = http.Header{
			"Accept":        {"application/json"},
			"Content-Type":  {"application/json"},
			"Authorization": {fmt.Sprintf("Bearer %s", token)},
		}
		res, err := client.Do(req)
		if err != nil {
			fmt.Println(err)
			return
		}
		if res.StatusCode == 429 {
			retry, err := strconv.Atoi(res.Header.Get("Retry-After"))
			if err != nil {
				fmt.Println(err)
				return
			}
			res.Body.Close()
			fmt.Println(retry) // TODO delete later
			time.Sleep(time.Duration(retry+1) * time.Second)
		} else if res.StatusCode == 200 {
			albumsReq := new(AlbumsReq)
			json.NewDecoder(res.Body).Decode(albumsReq)
			res.Body.Close()

			for _, album := range albumsReq.Items {
				albumIds = append(albumIds, album.ID)
			}

			if albumsReq.Next != nil {
				albumUrl = *albumsReq.Next
			} else {
				continueFlag = false
			}
		} else {
			fmt.Printf("Status code expected: 200\nStatus code received: %v\n", res.StatusCode)
			res.Body.Close()
			return
		}
	}

	var tracksWg sync.WaitGroup
	tracksWg.Add(len(albumIds))
	for _, albumId := range albumIds {
		go getCollabsFromAlbums(&tracksWg, albumId, artistId, idMap, token, wsConn, client)
	}
	tracksWg.Wait()
}

func getCollabsFromAlbums(tracksWg *sync.WaitGroup, albumId ID, artistId ID, idMap map[ID]bool, token string, wsConn *websocket.Conn, client *http.Client) {
	defer tracksWg.Done()

	for {
		tracksUrl := fmt.Sprintf("https://api.spotify.com/v1/albums/%s/tracks?market=US&limit=50", albumId)
		req, _ := http.NewRequest("GET", tracksUrl, nil)
		req.Header = http.Header{
			"Accept":        {"application/json"},
			"Content-Type":  {"application/json"},
			"Authorization": {fmt.Sprintf("Bearer %s", token)},
		}
		res, err := client.Do(req)
		if err != nil {
			fmt.Println(err)
			return
		}
		if res.StatusCode == 200 {
			tracksReq := new(TracksReq)
			json.NewDecoder(res.Body).Decode(tracksReq)
			res.Body.Close()

			for _, track := range tracksReq.Items {
				trackArtists := track.Artists[1:]

				for _, trackArtist := range trackArtists {
					if _, check := idMap[trackArtist.ID]; check {
						if trackArtist.ID != artistId {
							fmt.Println(track.Name) // TODO delete later
							var returnTrack TrackResp
							returnTrack.Id = track.ID
							returnTrack.Artists = track.Artists
							returnTrack.Name = track.Name
							err := wsConn.WriteJSON(returnTrack)
							if err != nil {
								fmt.Printf("Error sending message: %v\n", err.Error())
							}
						}
					}
				}
			}
			return
		} else if res.StatusCode == 429 {
			retry, err := strconv.Atoi(res.Header.Get("Retry-After"))
			if err != nil {
				fmt.Println(err)
				return
			}
			res.Body.Close()
			time.Sleep(time.Duration(retry+1) * time.Second)
		} else {
			fmt.Printf("Status code expected: 200\nStatus code received: %v\n", res.StatusCode)
			res.Body.Close()
			return
		}
	}
}
