"use client";
import { useEffect, useRef, useState } from 'react';
import Following from '../../components/Following';
import Collabs from '../../components/Collabs';
import { Grid } from 'react-loading-icons';
import { Collab } from '../../custom-types';

const ORIGINAL_URL = "https://api.spotify.com/v1/me/following?type=artist&limit=50";

export default function Home() {
    const [artists, setArtists] = useState([] as SpotifyApi.ArtistObjectFull[])
    const [isLoading, setLoading] = useState(true)
    const [url, setUrl] = useState(ORIGINAL_URL);
    const [collabTracks, setCollabTracks] = useState([] as Collab[]);
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

    const findCollabs = () => {
        setLoading(true); // retrieving collabs loading page or ("logging in" & "retrieving collabs" msgs param)
        ws.current?.send(JSON.stringify(
            {
                "token": localStorage.getItem("accessToken"),
                "artists": artistIds
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
            if (!collabTracks.includes(track.id)) {
                const collab:Collab = {
                    id: track.id,
                    artists: track.artists,
                    name: track.name
                }
                console.log(JSON.stringify(collab)); // todo delete later
                setCollabTracks([collab, ...collabTracks]);
            }
        };

        const wsCurrent = ws.current;
        return () => {
            wsCurrent.close();
        };
    }, []);

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

    if (isLoading || !artists) return <Grid fill="#1DB954"/>;

    return <div>
        {collabTracks.length > 0 ? <Collabs collabTracks={collabTracks}/> : <Following following={artists} findCollabs={findCollabs}/> }
    </div>;
}