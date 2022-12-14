export interface Collab {
    id: string
    artists: SpotifyApi.ArtistObjectSimplified[]
    name: string,
    img: SpotifyApi.ImageObject
}

export interface ArtistNode {
    id: number,
    img: string
}

export interface TopCollab {
    artists: { name: string, img: string }[];
    collabs: number;
}