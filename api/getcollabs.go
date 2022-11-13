package main

// TODO
// For loops that iterate over every album/track per artist and add to fanin channel if collab is in hashmap
// For loop that reads fanin channel (and appends result to list) until all go routines channels are closed

func getCollabs(request collabReq) []ID {
	token := request.Token
	artistIds := request.Artists

	artistIdMap := make(map[ID]bool)
	for _, id := range artistIds {
		artistIdMap[id] = true
	}

	c := make(chan ID)

	for _, id := range artistIds {
		go artistCollabs(id, artistIdMap, token, c)
	}

	return nil // TODO: return track id list
}

func artistCollabs(artistId ID, idMap map[ID]bool, token string, channel chan ID) {

}
