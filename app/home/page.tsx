"use client";
import { useEffect, useState } from 'react';
import Following from '../../components/Following';
import Collabs from '../../components/Collabs';
import { Grid } from 'react-loading-icons';

const ORIGINAL_URL = "https://api.spotify.com/v1/me/following?type=artist&limit=50";

export default function Home() {
    const [artists, setArtists] = useState([] as SpotifyApi.ArtistObjectFull[])
    const [isLoading, setLoading] = useState(true)
    const [url, setUrl] = useState(ORIGINAL_URL);
    // const [collabs, setCollabs] = useState([] as SpotifyApi.TrackObjectFull[]);
    const [collabs, setCollabs] = useState([] as string[]); // todo: remove later
    const [artistIds, setArtistIds] = useState([] as string[]);
    
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
        fetch("http://127.0.0.1:8080/collabs", { // TODO: Change to backend url before deploying
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    "token": localStorage.getItem("accessToken"),
                    "artists": artistIds
                }
            )
        })
        .then((res) => res.json())
        .then((data) => {
            setCollabs([data.message]); // TODO: parse data to be list of SpotifyApi.TrackObjectFull
        })
    }

    useEffect(()=> {
        fetchArtists();
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
        {collabs.length > 0 ? <Collabs collabs={collabs}/> : <Following following={artists} findCollabs={findCollabs}/> }
    </div>;
}