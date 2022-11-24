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
	Id    ID    `json:"id"`
	Image Image `json:"img"`
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
}

func artistCollabs(wg *sync.WaitGroup, artistId ID, token string, wsConn *Connection) {
	defer wg.Done()
	// find all tracks artist appears on and return via websocket (perhaps mark whether follow/all in resp)
	// TODO: call https://api.spotify.com/v1/artists/{id}/albums w/ include group set to appears_on (limit is 50 results, call multiple times)
	//  - https://developer.spotify.com/console/get-artist-albums/
	//  - Only keep albumIDS where "album_type": "album"
	//   - For said album ids, retrieve all tracks and return ones artists appears on
}

func followCollabs(wg *sync.WaitGroup, artistId ID, idMap map[ID]bool, token string, wsConn *Connection) {
	defer wg.Done()
	client := &http.Client{}
	albumUrl := fmt.Sprintf("https://api.spotify.com/v1/artists/%s/albums?include_groups=single%%2Calbum&market=US&limit=50", artistId)
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
			return
		}
		if res.StatusCode == 429 {
			retry, err := strconv.Atoi(res.Header.Get("Retry-After"))
			if err != nil {
				fmt.Println(err)
				return
			}
			res.Body.Close()
			time.Sleep(time.Duration(retry+2) * time.Second)
		} else if res.StatusCode == 200 {
			albumsReq := new(AlbumsReq)
			json.NewDecoder(res.Body).Decode(albumsReq)
			res.Body.Close()

			for _, album := range albumsReq.Items {
				var albumResp AlbumResp
				albumResp.Id = album.ID
				albumResp.Image = album.Images[1]
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
			return
		}
	}

	var tracksWg sync.WaitGroup
	tracksWg.Add(len(albumIds))
	for _, albumResp := range albumIds {
		go getCollabsFromAlbums(&tracksWg, albumResp, artistId, idMap, token, wsConn, client)
	}
	tracksWg.Wait()
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
				trackArtists := track.Artists[1:]

				for _, trackArtist := range trackArtists {
					if _, check := idMap[trackArtist.ID]; check {
						if trackArtist.ID != artistId {
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
