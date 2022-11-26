"use client";
import { useEffect, useRef, useState } from 'react';
import Following from '../../components/Following';
import Collabs from '../../components/Collabs';
import Loading from '../../components/Loading';
import { Collab } from '../../custom-types';

const ORIGINAL_URL = "https://api.spotify.com/v1/me/following?type=artist&limit=50";

export default function Home() {
    const [artists, setArtists] = useState([] as SpotifyApi.ArtistObjectFull[]);
    const [isLoading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState("Loading...");
    const [url, setUrl] = useState(ORIGINAL_URL);
    const [collabTracks, setCollabTracks] = useState([] as Collab[]);
    const [finalCollabs, setFinalCollabs] = useState([] as Collab[]);
    const [artistIds, setArtistIds] = useState([] as string[]);
    const ws = useRef(null as WebSocket | null);
    
    const fetchArtists = () => {
        fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `${localStorage.getItem("tokenType")} ${localStorage.getItem("accessToken")}`
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setArtists(artists => [...artists, ...data.artists.items]);
                if (data.artists.next === null) {
                    setLoading(false);
                } else {
                    setUrl(data.artists.next);
                }
            }
        )
    }

    const findCollabs = (ids: string[], mode: string) => {
        setLoadingMessage("Finding All Collabs...");
        setLoading(true);

        setTimeout(()=> { // TODO: Remove later (for testing)
            setLoading(false);
        }, 2000);
        setCollabTracks(
            [""] as any
        );

        ws.current?.send(JSON.stringify(
            {
                "token": localStorage.getItem("accessToken"),
                "selected": ids,
                "artists": artistIds,
                "mode": mode
            }
        ));
    }

    useEffect(()=> {
        fetchArtists();
        ws.current = new WebSocket("ws://localhost:8080/socket"); // Change before deployment
        ws.current.onopen = () => console.log("ws opened");
        ws.current.onclose = () => console.log("ws closed");

        ws.current.onmessage = e => {
            const track = JSON.parse(e.data);
            const collab:Collab = {
                id: track.id,
                artists: track.artists,
                name: track.name,
                img: track.img
            }
            if (isLoading) {
                setLoading(false);
            }
            setCollabTracks(current => [collab, ...current]);
        };

        const wsCurrent = ws.current;
        return () => {
            wsCurrent.close();
        };
    }, []);
    
    useEffect(()=> {
        const uniqueNames = new Set();
        const collabArray = collabTracks.filter(track => {
            const isDuplicate = uniqueNames.has(track.name);
            uniqueNames.add(track.name);
            return !isDuplicate;
        });
        setFinalCollabs(collabArray);
    }, [collabTracks])

    useEffect(()=> {
        if (url !== ORIGINAL_URL) {
            fetchArtists();
        };
    }, [url]);

    useEffect(()=> {
        setArtistIds(
            artists.map(artist => {
                return artist.id;
            })
        )
    }, [artists]);

    if (isLoading || !artists) return <Loading>{loadingMessage}</Loading>;

    return <div>
        {finalCollabs.length > 0 ? <Collabs collabTracks={finalCollabs} artists={artists}/> : <Following following={artists} findCollabs={findCollabs}/> }
    </div>;
}