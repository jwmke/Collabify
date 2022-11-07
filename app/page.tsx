'use client';

import { useState, useEffect } from "react";

const CLIENT_ID = "16f321bce7d5401ca1f1671d3f55720e";
const SPOTIFY_AUTHORIZE_ENDPOINT = "https://accounts.spotify.com/authorize";
const REDIRECT_URL_AFTER_LOGIN = "http://127.0.0.1:3000/loading";
const SCOPES = [ "user-follow-read", "playlist-modify-private" ];
const SCOPES_URL_PARAM = SCOPES.join("%20");

export default function Page() {
    const [win, setWindow]:any = useState(null);

    useEffect(()=>{
        setWindow(window);
    },[]);

    const handleLogin = () => {
        win.location = `${SPOTIFY_AUTHORIZE_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL_AFTER_LOGIN}&scope=${SCOPES_URL_PARAM}&response_type=token&show_dialog=true`;
    };

    return <div>
        <p>Hello World!</p>
        <button onClick={handleLogin}>login to spotify</button>
    </div>;
}