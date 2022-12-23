import { ArtistNode, Collab } from '../custom-types';
import Button from "./Button";
import { ForceGraph3D } from 'react-force-graph';
import * as THREE from 'three';
import { useEffect, useRef, useState } from "react";
import React, { forwardRef, useImperativeHandle } from "react";
import { Grid } from 'react-loading-icons';
import Preview from "./Preview";
import Header from "./Header";
import Summary from './Summary';
import useWindowDimensions from './hooks/useWindowDimensions';

interface Link {
    source: number;
    target: number;
    size: number;
    collabs: Collab[] | undefined;
}

const Collabs = forwardRef(({ artistIdSet, artistIdMap, idArtistMap, artistNameMap, nodes, artistPicMap, loading, selectedArtistsLength, artistIdPicMap }:
    { artistIdSet:Set<string>, artistIdMap: { [artist: string]: number }, idArtistMap: { [artist: number]: string }, artistNameMap: { [artist: string]: string }, nodes: ArtistNode[], artistPicMap: { [artist: number]: string }, loading:boolean, selectedArtistsLength:number, artistIdPicMap: { [artist: string]: string } }, ref) => {
    
    const [playlistMade, setPlaylistMade] = useState(false);
    const [highlightLink, setHighlightLink] = useState([] as number[]);
    const [previewCollabs, setPreviewCollabs] = useState([] as Collab[]);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [artistPics, setArtistPics] = useState([] as string[]);
    const [artistNames, setArtistNames] = useState([] as string[]);
    const processedArtists = useRef(new Set() as Set<string>);
    const totalCollabs = useRef(0);
    const { width } = useWindowDimensions();
    const mobile = width <= 480; 
    const linkRef = useRef({
        linkCollabs: new Map<string, Collab[]>(),
        maxSize: -1 as number
    });
    const summaryStatRef = useRef({
        artistsFound: new Set() as Set<string>,
        totalTracks: 0,
        topArtists: {} as { [artists: string]: number }
    })

    const closeLinkModal = () => {
        setHighlightLink([]);
        setPreviewCollabs([]);
        setArtistPics([]);
        setArtistNames([]);
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
                                            totalCollabs.current += reqList.length;
                                            setPlaylistMade(true);
                                            setTimeout(()=> {
                                                setPlaylistMade(false);
                                                totalCollabs.current = 0;
                                            }, 5000);
                                        } else {
                                            // TODO Error checking
                                        }
                                    } else {
                                        totalCollabs.current += 100;
                                    }
                                }
                            );
                        });
                    }
                );
            }
        );
    }

    const hash = (str:string) => {
        var hash = 0,
            i, chr;
        if (str.length === 0) return hash;
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return hash;
    }

    const addCollab = (track:Collab) => {
        if (track.id === "close") {
            processedArtists.current = artistIdSet;
            setSummaryOpen(true);
        } else {
            const srcArtistId = track.artists[0].id;
            track.artists.slice(1).forEach((artist:SpotifyApi.ArtistObjectSimplified) => {
                const tarArtistId = artist.id;
                if (artistIdSet.has(tarArtistId) && artistIdSet.has(srcArtistId)) {
                    processedArtists.current.add(tarArtistId);
                    processedArtists.current.add(srcArtistId);
                    const connection = JSON.stringify([srcArtistId, tarArtistId].slice().sort((a, b) => (hash(a) - hash(b))));
                    let collabs = linkRef.current.linkCollabs.get(connection);
                    const maxSize = linkRef.current.maxSize;
                    if (collabs === undefined) {
                        updateCollabStats(track, artist, srcArtistId, tarArtistId);
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
                            updateCollabStats(track, artist, srcArtistId, tarArtistId);
                            linkRef.current.maxSize = collabs.length > maxSize ? collabs.length : maxSize;
                            linkRef.current.linkCollabs.set(connection, collabs);
                        }
                    }
                }
            });
        }
    };

    const updateCollabStats = (track:Collab, artist:SpotifyApi.ArtistObjectSimplified, srcArtistId:string, tarArtistId:string) => {
        summaryStatRef.current.totalTracks += 1;
        const collabKey = JSON.stringify([{img: artistIdPicMap[track.artists[0].id], name: track.artists[0].name, id: track.artists[0].id}, {img: artistIdPicMap[artist.id], name: artist.name, id: artist.id}].slice().sort((a, b) => (hash(a.name) - hash(b.name))));
        if (collabKey in summaryStatRef.current.topArtists) {
            summaryStatRef.current.topArtists[collabKey] += 1;
        } else {
            summaryStatRef.current.topArtists[collabKey] = 1;
        }
        if (!summaryStatRef.current.artistsFound.has(srcArtistId)) {
            summaryStatRef.current.artistsFound.add(srcArtistId);
        }
        if (!summaryStatRef.current.artistsFound.has(tarArtistId)) {
            summaryStatRef.current.artistsFound.add(tarArtistId);
        }
    };

    const highlightLinkFromChild = (id1:string, id2:string) => {
        const newLink = [id1, id2].slice().sort((a, b) => (hash(a) - hash(b)));
        if (JSON.stringify(newLink) !== JSON.stringify(highlightLink)) {
            setHighlightLink([artistIdMap[newLink[0]], artistIdMap[newLink[1]]]);
            setArtistPics([artistIdPicMap[id1], artistIdPicMap[id2]]);
            setArtistNames([artistNameMap[id1], artistNameMap[id2]]);
            setPreviewCollabs(linkRef.current.linkCollabs.get(JSON.stringify([id1, id2].slice().sort((a, b) => (hash(a) - hash(b))))) || []);
        }
    }

    const normalize = (enteredValue:number, normalizedMin=2, normalizedMax=15) => {
        if (enteredValue === 1)
            return 2;
        var mx = (Math.log((enteredValue-1))/(Math.log(linkRef.current.maxSize-1)));
        var preshiftNormalized = mx*(normalizedMax-normalizedMin);
        var shiftedNormalized = preshiftNormalized + normalizedMin;
        
        return shiftedNormalized;
    }

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
            }, mobile ? 1000 : 2000);
        }
    }, []);

    return <div className='h-full w-full relative'>
        <div className='absolute h-full w-full z-20'>
            <Header headerType="Collab"/>
            <div className={`md:float-right relative top-3 md:-top-20 md:mr-5 ${mobile ? "mobile-preview-center" : ""}`}>
                {!summaryOpen && previewCollabs.length > 0 ? <Preview tracks={previewCollabs} artistPics={artistPics} artistNames={artistNames} closeModal={closeLinkModal}/> : null}
            </div>
            <div className='bottom-6 fixed lg-button-center'>
                <Button onClick={() => savePlayList()} size="lg" loading={processedArtists.current.size/(selectedArtistsLength * 1.0)} tooltip="Create a new playlist with all shown collabs.">Create Playlist</Button>
            </div>
            {summaryOpen ? <div className={mobile ? "mt-6" : ""}><Summary 
                collabStats={[summaryStatRef.current.totalTracks, summaryStatRef.current.artistsFound.size]} 
                closeModal={()=>setSummaryOpen(false)} 
                topCollabArtists={summaryStatRef.current.topArtists}
                highlightLink={highlightLinkFromChild} /></div> : null}
            {loading && <div className={`${mobile ? "top-6" : ""} md:bottom-6 -right-2 w-18 fixed text-center`}>
                <Grid fill="#1DB954" height={"2.5em"}/>
                {/* <p className='text-white text-xs mt-2'>Loading...</p> */}
            </div>}
            {playlistMade ?<div className='fixed w-1/3 h-12 text-center bg-green rounded-3xl alert-center top-7 pt-2 transition-opacity ease-in-out duration-300'>
                <p className='text-black font-bold text-lg'>{`Playlist with ${totalCollabs.current} collabs succesfully created.`}</p>
            </div> : null}
        </div>
        <div className='absolute z-10'>
            <ForceGraph3D graphData={gData} backgroundColor={"#212121"}
                linkWidth={(link:any) => {
                    const currentLink = [link.source, link.target].slice().sort((a, b) => (hash(a) - hash(b)));
                    return JSON.stringify(highlightLink) === JSON.stringify(currentLink) ? (normalize(link.size)) + 2 : (normalize(link.size))}
                }
                linkColor={(link:any) => {
                        const currentLink = [link.source, link.target].slice().sort((a, b) => (hash(a) - hash(b)));
                        return JSON.stringify(highlightLink) === JSON.stringify(currentLink) ? "#1db954" : "#b3b3b3"
                    }
                }
                onLinkHover={(link:any) => {
                    if (link) {
                        const newLink = [link.source.id, link.target.id].slice().sort((a, b) => (hash(a) - hash(b)));
                        if (JSON.stringify(newLink) !== JSON.stringify(highlightLink)) {
                            setHighlightLink(newLink);
                            setArtistPics([artistPicMap[link.source.id], artistPicMap[link.target.id]]);
                            setArtistNames([artistNameMap[idArtistMap[link.source.id]], artistNameMap[idArtistMap[link.target.id]]]);
                            setPreviewCollabs(link.collabs);
                        }
                    }
                }}
                linkResolution={15}
                linkHoverPrecision={6}
                ref={forceRef}
                linkOpacity={0.5}
                nodeThreeObject={({ img }:any) => {
                        const imgTexture = new THREE.TextureLoader().load(img);
                        const material = new THREE.SpriteMaterial({ map: imgTexture });
                        const sprite = new THREE.Sprite(material);
                        sprite.scale.set(20, 20, 1);

                        return sprite;
                    }
            }
            />
        </div>
    </div>
});

export default React.memo(Collabs);