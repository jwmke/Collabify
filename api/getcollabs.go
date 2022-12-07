package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"sync"
	"time"
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
	Image   Image          `json:"img"`
}

type AlbumResp struct {
	Id      ID             `json:"id"`
	Image   Image          `json:"img"`
	Artists []SimpleArtist `json:"artists"`
}

func getCollabs(request collabReq, wsConn *Connection) {
	token := request.Token
	artistIds := request.Artists
	selectedArtistIds := request.Selected
	followCollabBool := request.Mode == "follow"
	artistIdMap := make(map[ID]bool)
	if followCollabBool {
		for _, id := range artistIds {
			artistIdMap[id] = true
		}
	}

	var wg sync.WaitGroup
	wg.Add(len(selectedArtistIds))
	for _, id := range selectedArtistIds {
		if followCollabBool {
			go followCollabs(&wg, id, artistIdMap, token, wsConn)
		} else {
			go artistCollabs(&wg, id, token, wsConn)
		}
	}
	wg.Wait()
	var closeConnectionResp TrackResp
	closeConnectionResp.Id = "close"
	err := wsConn.Send(closeConnectionResp)
	if err != nil {
		fmt.Printf("Error sending message: %v\n", err.Error())
	}
}

func artistCollabs(wg *sync.WaitGroup, artistId ID, token string, wsConn *Connection) {
	defer wg.Done()

	client := &http.Client{}
	albumIds := getAlbums(client, artistId, token, "all")

	var tracksWg sync.WaitGroup
	tracksWg.Add(len(albumIds))
	for _, albumResp := range albumIds {
		go getCollabsFromAlbums(&tracksWg, albumResp, artistId, nil, token, wsConn, client)
	}
	tracksWg.Wait()
}

func followCollabs(wg *sync.WaitGroup, artistId ID, idMap map[ID]bool, token string, wsConn *Connection) {
	defer wg.Done()
	client := &http.Client{}
	albumIds := getAlbums(client, artistId, token, "follow")

	var tracksWg sync.WaitGroup
	tracksWg.Add(len(albumIds))
	for _, albumResp := range albumIds {
		go getCollabsFromAlbums(&tracksWg, albumResp, artistId, idMap, token, wsConn, client)
	}
	tracksWg.Wait()
}

func getAlbums(client *http.Client, artistId ID, token string, mode string) []AlbumResp {
	include := ""
	if mode == "all" {
		include = "&include_groups=appears_on"
	}
	albumUrl := fmt.Sprintf("https://api.spotify.com/v1/artists/%s/albums?include_groups=single%%2Calbum&market=US&limit=50%s", artistId, include)
	continueFlag := true
	var albumIds []AlbumResp
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
			return nil
		}
		if res.StatusCode == 429 {
			retry, err := strconv.Atoi(res.Header.Get("Retry-After"))
			if err != nil {
				fmt.Println(err)
				return nil
			}
			res.Body.Close()
			// fmt.Println(retry) // For debugging
			time.Sleep(time.Duration(retry+2) * time.Second)
		} else if res.StatusCode == 200 {
			albumsReq := new(AlbumsReq)
			json.NewDecoder(res.Body).Decode(albumsReq)
			res.Body.Close()

			for _, album := range albumsReq.Items {
				var albumResp AlbumResp
				albumResp.Id = album.ID
				albumResp.Image = album.Images[1]
				albumResp.Artists = album.Artists
				albumIds = append(albumIds, albumResp)
			}

			if albumsReq.Next != nil {
				albumUrl = *albumsReq.Next
			} else {
				continueFlag = false
			}
		} else {
			fmt.Printf("Status code expected: 200\nStatus code received: %v\n", res.StatusCode)
			res.Body.Close()
			return nil
		}
	}
	return albumIds
}

func getCollabsFromAlbums(tracksWg *sync.WaitGroup, album AlbumResp, artistId ID, idMap map[ID]bool, token string, wsConn *Connection, client *http.Client) {
	defer tracksWg.Done()
	for {
		tracksUrl := fmt.Sprintf("https://api.spotify.com/v1/albums/%s/tracks?market=US&limit=50", album.Id)
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
				if idMap == nil {
					var trackArtists []SimpleArtist
					if album.Artists[0].Name == "Various Artists" {
						trackArtists = track.Artists
					} else {
						trackArtists = track.Artists[1:]
					}
					for _, trackArtist := range trackArtists {
						if trackArtist.ID == artistId {
							sendCollabResp(track, album, wsConn)
						}
					}
				} else {
					trackArtists := track.Artists[1:]
					for _, trackArtist := range trackArtists {
						if _, check := idMap[trackArtist.ID]; check {
							if trackArtist.ID != artistId {
								sendCollabResp(track, album, wsConn)
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
			time.Sleep(time.Duration(retry+2) * time.Second)
		} else {
			fmt.Printf("Status code expected: 200\nStatus code received: %v\n", res.StatusCode)
			res.Body.Close()
			return
		}
	}
}

func sendCollabResp(track SimpleTrack, album AlbumResp, wsConn *Connection) {
	var returnTrack TrackResp
	returnTrack.Id = track.ID
	returnTrack.Artists = track.Artists
	returnTrack.Name = track.Name
	returnTrack.Image = album.Image
	err := wsConn.Send(returnTrack)
	if err != nil {
		fmt.Printf("Error sending message: %v\n", err.Error())
	}
}
