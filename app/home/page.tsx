"use client";
import { useEffect, useState } from 'react';
import Following from '../../components/Following';
import { Grid } from 'react-loading-icons';

export default function Home() {
    const [artists, setArtists] = useState([])
    const [isLoading, setLoading] = useState(true)
    const [url, setUrl] = useState("https://api.spotify.com/v1/me/following?type=artist&limit=50");

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
                setArtists([...artists, ...data.artists.items] as any);
                if (data.artists.next === null) {
                    setLoading(false);
                } else {
                    setUrl(data.artists.next);
                }
            }
        )
    }

    useEffect(()=> {
        fetchArtists();
    }, []);

    useEffect(()=> {
        fetchArtists();
    }, [url]);

    if (isLoading || !artists) return <Grid fill="#1DB954"/>;

    return <div>
        <Following following={artists}/>
    </div>;
}