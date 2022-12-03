import Image from "next/image";
import { ArtistNode, Collab } from '../custom-types';
import Button from "./Button";
import { ForceGraph3D } from 'react-force-graph';
import * as THREE from 'three';
import { useEffect, useRef, useState } from "react";
import React, { forwardRef, useImperativeHandle } from "react";
import Preview from "./Preview";

interface Link {
    source: number;
    target: number;
    size: number;
    collabs: Collab[] | undefined;
}

const Collabs = forwardRef(({ artistIdSet, artistIdMap, nodes }:
    { artistIdSet:Set<string>, artistIdMap: { [artist: string]: number }, nodes: ArtistNode[] }, ref) => {
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

    const [highlightLink, setHighlightLink] = useState([] as number[]);
    const [previewCollabs, setPreviewCollabs] = useState([] as Collab[]);
    const linkRef = useRef({
        linkCollabs: new Map<string, Collab[]>(),
        maxSize: -1 as number
    });

    const addCollab = (track:Collab) => {
        const srcArtistId = track.artists[0].id;
        track.artists.slice(1).forEach((artist:SpotifyApi.ArtistObjectSimplified) => {
            const tarArtistId = artist.id;
            if (artistIdSet.has(tarArtistId) && artistIdSet.has(srcArtistId)) {
                const connection = JSON.stringify([srcArtistId, tarArtistId].sort());
                let collabs = linkRef.current.linkCollabs.get(connection);
                const maxSize = linkRef.current.maxSize;
                if (collabs === undefined) {
                    linkRef.current.maxSize = 1 > maxSize ? 1 : maxSize;
                    linkRef.current.linkCollabs.set(connection, [track]);
                } else {
                    collabs.push(track);
                    linkRef.current.maxSize = collabs.length > maxSize ? collabs.length : maxSize;
                    linkRef.current.linkCollabs.set(connection, collabs);
                }
                
                
            }
        });
    };

    let links = [] as Link[];
    linkRef.current.linkCollabs.forEach((value, key)=> {
        const keyArray = JSON.parse(key);
        links.push({
            source: artistIdMap[keyArray[0]],
            target: artistIdMap[keyArray[1]],
            size: value.length,
            collabs: linkRef.current.linkCollabs.get(key)
        });
    });
    
    useImperativeHandle(ref, () => {
        return {
            addCollab: addCollab
        };
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

    return <div>
        <ForceGraph3D graphData={gData} backgroundColor={"#212121"}
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
                    const newLink = [link.source.id, link.target.id].sort();
                    if (JSON.stringify(newLink) !== JSON.stringify(highlightLink)) {
                        setHighlightLink(newLink);
                        console.log(link.collabs);
                        setPreviewCollabs(link.collabs);
                    }
                }
            }}
            linkHoverPrecision={6}
            ref={forceRef}
            linkOpacity={0.5}
            nodeThreeObject={({ img }:any) => {
                    const imgTexture = new THREE.TextureLoader().load(img);
                    const material = new THREE.SpriteMaterial({ map: imgTexture });
                    const sprite = new THREE.Sprite(material);
                    sprite.scale.set(15, 15, 1);

                    return sprite;
                }
        }
        />
        {previewCollabs ? <Preview tracks={previewCollabs}/> : null}
    </div>
});

export default React.memo(Collabs);