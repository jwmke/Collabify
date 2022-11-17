"use client";
import { useEffect, useState } from 'react';
import Following from '../../components/Following';
import Collabs from '../../components/Collabs';
import { Grid } from 'react-loading-icons';
import { io } from "socket.io-client";

const socket = io('http://localhost:8080');

const ORIGINAL_URL = "https://api.spotify.com/v1/me/following?type=artist&limit=50";

export default function Home() {
    const [artists, setArtists] = useState([] as SpotifyApi.ArtistObjectFull[])
    const [isLoading, setLoading] = useState(true)
    const [url, setUrl] = useState(ORIGINAL_URL);
    const [collabIds, setCollabIds] = useState([] as string[]);
    const [artistIds, setArtistIds] = useState([] as string[]);
    const [isConnected, setIsConnected] = useState(socket.connected);
    
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
        socket.emit('getCollabs', JSON.stringify(
            {
                "token": localStorage.getItem("accessToken"),
                "artists": artistIds
            }
        ));
    }

    useEffect(()=> {
        fetchArtists();
        socket.on('connect', () => {
            setIsConnected(true);
        });
      
        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('addCollab', (collabId) => {
            setCollabIds([collabId, ...collabIds]);
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('addCollab');
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
        {collabIds.length > 0 ? <Collabs collabIds={collabIds}/> : <Following following={artists} findCollabs={findCollabs}/> }
    </div>;
}