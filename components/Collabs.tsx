import Image from "next/image";
import { ArtistNode, Collab } from '../custom-types';
import Button from "./Button";
import { ForceGraph3D } from 'react-force-graph';
import * as THREE from 'three';
import { useEffect, useRef, useState } from "react";

interface Link {
    source: number;
    target: number;
    size: number;
}

export default function Collabs({ collabTracks, artists, nodes }:{ collabTracks:Collab[], artists:SpotifyApi.ArtistObjectFull[], nodes: ArtistNode[] }) {
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

    const [highlightLink, setHighlightLink] = useState([] as number[]);

    const artistIdMap: { [artist: string]: number } = {};
    artists.forEach((artist:SpotifyApi.ArtistObjectFull, idx: number) => {
        artistIdMap[artist.id] = idx;
    });

    const artistIds = artists.map((artist:SpotifyApi.ArtistObjectFull) => (artist.id));

    let linkSizes = new Map<string, number>();
    let links: Link[] = [];
    let maxSize: number = -1;

    collabTracks.forEach((track:Collab)=>{
        const srcArtistId = track.artists[0].id;
        track.artists.slice(1).forEach((artist:SpotifyApi.ArtistObjectSimplified) => {
            const tarArtistId = artist.id;
            if (artistIds.includes(tarArtistId) && artistIds.includes(srcArtistId)) {
                const connection = JSON.stringify([srcArtistId, tarArtistId].sort());
                let linkSize = linkSizes.get(connection);
                linkSize = linkSize === undefined ? 1 : linkSize + 1;
                linkSizes.set(connection, linkSize);
                maxSize = linkSize > maxSize ? linkSize : maxSize;
            }
        });
    });

    linkSizes.forEach((value, key)=> {
        const keyArray = JSON.parse(key);
        links.push({
            source: artistIdMap[keyArray[0]],
            target: artistIdMap[keyArray[1]],
            size: value,
        });
    });

    const gData = {
        nodes: nodes,
        links: links
    };

    const forceRef = useRef(null as any);

    useEffect(() => {
        if (forceRef && forceRef.current) {
            forceRef.current.d3Force("charge").strength(-10);
            setTimeout(()=> {
                forceRef.current.d3Force("charge").strength(-1);
            }, 2500);
        }
    }, []);

    return <ForceGraph3D graphData={gData} backgroundColor={"#212121"}
        linkWidth={(link:any) => {
            const currentLink = [link.source, link.target].sort();
            return JSON.stringify(highlightLink) === JSON.stringify(currentLink) ? (link.size * 0.5) + 2 : (link.size * 0.5)}
        }
        linkColor={(link:any) => {
                const currentLink = [link.source, link.target].sort();
                return JSON.stringify(highlightLink) === JSON.stringify(currentLink) ? "#1db954" : "#b3b3b3"
            }
        }
        onLinkHover={(link:any) => {
            if (link) {
                setHighlightLink([link.source.id, link.target.id].sort());
            }
        }}
        linkHoverPrecision={6}
        ref={forceRef}
        
        nodeThreeObject={({ img }:any) => {
                const imgTexture = new THREE.TextureLoader().load(img);
                const material = new THREE.SpriteMaterial({ map: imgTexture });
                const sprite = new THREE.Sprite(material);
                sprite.scale.set(15, 15, 1);

                return sprite;
            }
        }
    />
}