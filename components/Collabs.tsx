import Image from "next/image";
import { useState } from "react";

export default function Collabs({ collabIds }:{ collabIds:string[] }) {
    const [collabs, setCollabs] = useState([] as SpotifyApi.TrackObjectFull[]);
    return <div>
        <p>COLLABS</p>
        <div>{collabIds.map((track:string)=>{
            return <div key={track}>
                <div>{track}</div>
                {/* TODO: Get pictures of artists who collabed for this track */}
            </div>;
        })}</div>
    </div>;
}