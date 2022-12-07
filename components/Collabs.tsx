import { ArtistNode, Collab } from '../custom-types';
import Button from "./Button";
import { ForceGraph3D } from 'react-force-graph';
import * as THREE from 'three';
import { useEffect, useRef, useState } from "react";
import React, { forwardRef, useImperativeHandle } from "react";
import { Grid } from 'react-loading-icons';
import Preview from "./Preview";
import Header from "./Header";

interface Link {
    source: number;
    target: number;
    size: number;
    collabs: Collab[] | undefined;
}

const Collabs = forwardRef(({ artistIdSet, artistIdMap, nodes, artistPicMap, loading }:
    { artistIdSet:Set<string>, artistIdMap: { [artist: string]: number }, nodes: ArtistNode[], artistPicMap: { [artist: number]: string }, loading:boolean }, ref) => {
    
    const [playlistMade, setPlaylistMade] = useState(false);
    const [highlightLink, setHighlightLink] = useState([] as number[]);
    const [previewCollabs, setPreviewCollabs] = useState([] as Collab[]);
    const [artistPics, setArtistPics] = useState([] as string[]);
    const linkRef = useRef({
        linkCollabs: new Map<string, Collab[]>(),
        maxSize: -1 as number
    });

    const closeLinkModal = () => {
        setHighlightLink([]);
        setPreviewCollabs([]);
        setArtistPics([]);
    }
    
    const savePlayList = () => {
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `${localStorage.getItem("tokenType")} ${localStorage.getItem("accessToken")}`
        }

        const playlistCreateBody = {
            "name": "Collabify",
            "description": "Playlist containing all of the collabs between your followed artists.",
            "public": false
        }

        // TODO Ask let user know that app is still finding collabs and confirm that they want to make playlist with existing found collabs, or keep waiting
        // Make finding timer that updates every 12 seconds
        fetch("https://api.spotify.com/v1/me", { headers: headers })
            .then((res) => res.json())
            .then((userData) => {
                fetch(`https://api.spotify.com/v1/users/${userData.id}/playlists`, { method: 'POST', headers: headers, body: JSON.stringify(playlistCreateBody) })
                    .then((res) => res.json())
                    .then((playlistData) => {
                        let reqBodies: string[][] = [];
                        let reqList: string[] = [];
                        linkRef.current.linkCollabs.forEach((collabs) => {
                            collabs.forEach((collab) => {
                                if (reqList.length === 100) {
                                    reqBodies.push(reqList);
                                    reqList = [];
                                }
                                reqList.push(`spotify:track:${collab.id}`);
                            });
                        });

                        if (reqList.length !== 0)
                            reqBodies.push(reqList);
                        
                        reqBodies.forEach((tracksAddBody, idx) => {
                            fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, { method: 'POST', headers: headers, body: JSON.stringify({"uris": tracksAddBody})})
                                .then((res) => {
                                    if (idx === reqBodies.length-1) {
                                        if (res.status === 201) {
                                            setPlaylistMade(true); // TODO Make success notification
                                        } else {
                                            // TODO Error checking
                                        }
                                    }
                                }
                            );
                        });
                    }
                );
            }
        );
    }

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
                    let trackNotInCollabs = true;
                    collabs.every((collab) => {
                        if (collab.id === track.id) {
                            trackNotInCollabs = false;
                            return false;
                        }
                        return true;
                    });
                    if (trackNotInCollabs) {
                        collabs.push(track);
                        linkRef.current.maxSize = collabs.length > maxSize ? collabs.length : maxSize;
                        linkRef.current.linkCollabs.set(connection, collabs);
                    }
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
            collabs: value
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
            }, 2000);
        }
    }, []);

    return <div className='h-full w-full relative'>
        <div className='absolute h-full w-full z-20'>
            <Header headerType="Collab"/>
            <div className='float-right relative -top-20 mr-5'>
                {previewCollabs.length > 0 ? <Preview tracks={previewCollabs} artistPics={artistPics} closeModal={closeLinkModal}/> : null}
            </div>
            <div className='bottom-6 fixed lg-button-center'>
                <Button onClick={() => savePlayList()} size="lg" tooltip="Create a new playlist with all shown collabs.">Create Playlist</Button>
            </div>
            {loading && <div className='bottom-6 -right-2 w-18 fixed text-center'>
                <Grid fill="#1DB954" height={"2.5em"}/>
                {/* <p className='text-white text-xs mt-2'>Loading...</p> */}
            </div>}
        </div>
        <div className='absolute z-10'>
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
                            setArtistPics([artistPicMap[link.source.id], artistPicMap[link.target.id]]);
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
        </div>
    </div>
});

export default React.memo(Collabs);