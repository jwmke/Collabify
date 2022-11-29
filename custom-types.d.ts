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