import Image from "next/image";
import { Collab } from '../custom-types';
import Button from "./Button";
import { ForceGraph3D } from 'react-force-graph';
import * as THREE from 'three';

export default function Collabs({ collabTracks, artists }:{ collabTracks:Collab[], artists:SpotifyApi.ArtistObjectFull[] }) {
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
    
    // return <div className="h-screen bg-dark-gray font-lato">
    //     <div className="text-white font-bold text-4xl">Collabs</div>
    //     <div className="w-2/3 mx-auto grid grid-cols-7 gap-4 mt-5 h-2/3 overflow-y-scroll">
    //         {collabTracks.map((track:Collab)=>{
    //             return <div key={track.id}>
    //                 <Image src={track.img.url} alt={track.name} width={160} height={160}/>
    //                 <div className="text-white font-bold">{track.name}</div>
    //                 <div className="text-white font-bold">{track.artists[0].name}</div>
    //                 <br/>
    //             </div>;
    //         })}
    //     </div>
    //     <div className="mx-auto w-80 mt-8">
    //         <Button onClick={() => savePlayList()} size="lg">Save To Playlist</Button>
    //     </div>
    // </div>;

    const imgs = artists.map((artist:SpotifyApi.ArtistObjectFull) => {
        return artist.images[2].url;
    });

    const artistIdMap: { [artist: string]: number } = {};
    artists.forEach((artist:SpotifyApi.ArtistObjectFull, idx: number) => {
        artistIdMap[artist.id] = idx;
    });

    const artistIds = artists.map((artist:SpotifyApi.ArtistObjectFull) => (artist.id));

    const nodes = imgs.map((img, id) => ({ id, img }));

    let linkSizes = new Map<string[], number>();
    let links: {
        source: number;
        target: number;
        size: number;
    }[] = [];
    let maxSize: number = -1;

    collabTracks.forEach((track:Collab)=>{
        const srcArtistId = track.artists[0].id;
        track.artists.slice(1).forEach((artist:SpotifyApi.ArtistObjectSimplified) => {
            const tarArtistId = artist.id;
            if (artistIds.includes(artist.id)) {
                const connection = [srcArtistId, tarArtistId].sort();
                let linkSize = linkSizes.get(connection);
                linkSize = linkSize === undefined ? 1 : linkSize + 1;
                linkSizes.set(connection, linkSize);
                maxSize = linkSize > maxSize ? linkSize : maxSize;
            }
        });
    });

    for (const [key, value] of Object.entries(linkSizes)) {
        links.push({
            source: artistIdMap[key[0]],
            target: artistIdMap[key[1]],
            size: value
        })
    }

    const gData = {
        nodes: nodes,
        links: links
    };

    return <ForceGraph3D graphData={gData} backgroundColor={"#212121"}
        linkWidth={(link) => (maxSize) - ((link as any).size * 0.5)}
        nodeThreeObject={({ img }:any) => {
                const imgTexture = new THREE.TextureLoader().load(img);
                const material = new THREE.SpriteMaterial({ map: imgTexture });
                const sprite = new THREE.Sprite(material);
                sprite.scale.set(12, 12, 1);

                return sprite;
            }
        }
    />
}