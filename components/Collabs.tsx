import Image from "next/image";
import { Collab } from '../custom-types';
import Button from "./Button";

export default function Collabs({ collabTracks }:{ collabTracks:Collab[] }) {
    
    const savePlayList = () => {
        // Endpoints
        // GET https://api.spotify.com/v1/me (user_id = resp.id)
        // POST https://api.spotify.com/v1/users/{user_id}/playlists (playlist_id = resp.id)
        // body = {
        //   "name": "Collabify",
        //   "description": "Playlist containing all of the collabs between your followed artists. (Created with collabify.fun)",
        //   "public": false
        // }
        // https://api.spotify.com/v1/playlists/{playlist_id}/tracks
        // body = {"uris": ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh","spotify:track:1301WleyT98MSxVHPZCA6M"]} // Max 100 items
    }
    
    return <div className="h-screen bg-dark-gray font-lato">
        <div className="text-white font-bold text-4xl">Collabs</div>
        <div className="w-2/3 mx-auto grid grid-cols-7 gap-4 mt-5 h-2/3 overflow-y-scroll">
            {collabTracks.map((track:Collab)=>{
                return <div key={track.id}>
                    <Image src={track.img.url} alt={track.name} width={160} height={160}/>
                    <div className="text-white font-bold">{track.name}</div>
                    <div className="text-white font-bold">{track.artists[0].name}</div>
                    <br/>
                </div>;
            })}
        </div>
        <div className="mx-auto w-80 mt-8">
            <Button onClick={() => savePlayList()} size="lg">Save To Playlist</Button>
        </div>
    </div>;
}