'use client';

import { useState, useEffect } from "react";
import Image from 'next/image';
import Button from "../components/Button";
import { useRouter } from "next/navigation";

const CLIENT_ID = "16f321bce7d5401ca1f1671d3f55720e";
const SPOTIFY_AUTHORIZE_ENDPOINT = "https://accounts.spotify.com/authorize";
const REDIRECT_URL_AFTER_LOGIN = "http://127.0.0.1:3000/loading";
const SCOPES = [ "user-follow-read", "playlist-modify-private" ];
const SCOPES_URL_PARAM = SCOPES.join("%20");

export default function Page() {
    const [win, setWindow] = useState(null as Window|null);
    const router = useRouter();

    useEffect(()=>{
        setWindow(window);
        if (localStorage.getItem("accessToken")) {
            router.replace('/home');
        }
    },[]);

    const handleLogin = () => {
        if (win) {
            win.location = `${SPOTIFY_AUTHORIZE_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL_AFTER_LOGIN}&scope=${SCOPES_URL_PARAM}&response_type=token&show_dialog=true`;
        }
    };

    return <div className="h-screen bg-dark-gray font-lato">
        <div className="mx-auto w-3/4">
            <Image className="mx-auto pt-10" width={500} height={500} src={"/img/c-t-t.png"} alt="collabify-logo" priority/>
            <h1 className="text-white font-bold text-5xl text-center">Welcome to Collabify</h1>
            <div className="w-96 text-center mx-auto mt-8">
                <p className="text-white text-xl">Discover all of the collaborations between your favorite artist on Spotify.</p>
            </div>
            <div className="text-center mt-16 w-80 mx-auto">
                <Button onClick={handleLogin} size="lg">Log In With Spotify</Button>
            </div>
        </div>
    </div>;
}