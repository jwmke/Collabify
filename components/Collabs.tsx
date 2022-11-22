import Image from "next/image";
import { useState } from "react";
import { Collab } from '../custom-types';

export default function Collabs({ collabTracks }:{ collabTracks:Collab[] }) {
    return <div className="h-screen bg-dark-gray font-lato">
        <div className="text-white font-bold text-4xl">Collabs</div>
        <div className="w-2/3 mx-auto grid grid-cols-7 gap-4 mt-5 h-2/3 overflow-y-scroll">
            {collabTracks.map((track:Collab)=>{
                return <div key={track.id}>
                    <Image src={track.img.url} alt={track.name} width={160} height={160}/>
                    <div className="text-white font-bold">{track.name}</div>
                    <div className="text-white font-bold">{track.artists[0].name}</div>
                    <br/>
                </div>;
            })}
        </div>
    </div>;
}