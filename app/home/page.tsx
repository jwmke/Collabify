"use client";
import { useEffect, useState } from 'react';
import Following from '../../components/Following';

const FOLLOWER_ENDPOINT = 'https://api.spotify.com/v1/me/following?type=artist&limit=50'
  
export default function Home() {
    const [data, setData] = useState(null)
    const [isLoading, setLoading] = useState(false)

    useEffect(()=> {
        setLoading(true)
        fetch(FOLLOWER_ENDPOINT, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `${localStorage.getItem("tokenType")} ${localStorage.getItem("accessToken")}`
            },
        })
          .then((res) => res.json())
          .then((data) => {
            setData(data)
            setLoading(false)
          })
    }, [])

    if (isLoading) return <p>Loading...</p>
    if (!data) return <p>Loading...</p>

    return <div>
        <Following following={data}/>
    </div>;
}