package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
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

func getCollabs(request collabReq) []ID {
	token := request.Token
	artistIds := request.Artists

	artistIdMap := make(map[ID]bool)
	for _, id := range artistIds {
		artistIdMap[id] = true
	}

	var wg sync.WaitGroup
	channel := make(chan ID)
	for _, id := range artistIds {
		wg.Add(1)
		go artistCollabs(&wg, id, artistIdMap, token, channel)
	}

	var collabs []ID

	wg.Wait()

	for trackId := range channel {
		collabs = append(collabs, trackId)
	}

	return removeDuplicateValues(collabs)
}

func artistCollabs(wg *sync.WaitGroup, artistId ID, idMap map[ID]bool, token string, channel chan ID) {
	defer wg.Done()

	albumUrl := fmt.Sprintf("https://api.spotify.com/v1/artists/%s/albums?include_groups=single%2Calbum&market=US&limit=50&offset=%d", artistId)
	client := &http.Client{}
	headers := http.Header{
		"Accept":        {"application/json"},
		"Content-Type":  {"application/json"},
		"Authorization": {fmt.Sprintf("Bearer %s", token)},
	}

	continueFlag := true
	var albumIds []ID

	for continueFlag {
		req, _ := http.NewRequest("GET", albumUrl, nil)
		req.Header = headers
		res, _ := client.Do(req)
		defer res.Body.Close()
		albumsReq := new(AlbumsReq)
		json.NewDecoder(res.Body).Decode(albumsReq)

		for _, album := range albumsReq.Items {
			albumIds = append(albumIds, album.ID)
		}

		if albumsReq.Next != nil {
			albumUrl = *albumsReq.Next
		} else {
			continueFlag = false
		}
	}

	for _, albumId := range albumIds {
		tracksUrl := fmt.Sprintf("https://api.spotify.com/v1/albums/%s/tracks?market=US&limit=50", albumId)
		req, _ := http.NewRequest("GET", tracksUrl, nil)
		req.Header = headers
		res, _ := client.Do(req)
		defer res.Body.Close()
		tracksReq := new(TracksReq)
		json.NewDecoder(res.Body).Decode(tracksReq)

		for _, track := range tracksReq.Items {
			trackArtists := track.Artists[1:]
			for _, trackArtist := range trackArtists {
				if _, check := idMap[trackArtist.ID]; check {
					channel <- track.ID
				}
			}
		}
	}
}

func removeDuplicateValues(intSlice []ID) []ID {
	keys := make(map[ID]bool)
	list := []ID{}

	for _, entry := range intSlice {
		if _, value := keys[entry]; !value {
			keys[entry] = true
			list = append(list, entry)
		}
	}

	return list
}
