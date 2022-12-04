import Image from "next/image";
import { useState } from "react";
import { Collab } from "../custom-types";

export default function Preview({ tracks, artistPics }: { tracks:Collab[], artistPics:string[] }) {
    const [selectedTrack, setSelectedTrack] = useState(tracks[0] as Collab);
    return <div>
        <div>
            <Image src={artistPics[0]} alt={"Artist 1"} width={70} height={70} />
            <p>x</p>
            <Image src={artistPics[1]} alt={"Artist 2"} width={70} height={70} />
        </div>
        <div/>
        <div className="grid grid-cols-4 gap-1 w-72 h-36 overflow-y-scroll">
            {tracks.map((track:Collab) => <div className={"overflow-hidden rounded-md" + (track.id === selectedTrack.id) ? " border-solid border-green border-2" : ""}>
                <Image key={track.id} className="hover:cursor-pointer hover:scale-110 transition ease-in-out duration-150"
                 onClick={() => setSelectedTrack(track)}
                 src={track.img.url} alt={track.name} width={30} height={30}/>
            </div>)}
        </div>
        <div/>
        <div>
            <Image src={selectedTrack.img.url} alt={selectedTrack.name} width={100} height={100}/>
            <p>{selectedTrack.name}</p>
        </div>
    </div>; 
}
