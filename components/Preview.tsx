import Image from "next/image";
import { useState } from "react";
import { Collab } from "../custom-types";

export default function Preview({ tracks, artistPics, closeModal }: { tracks:Collab[], artistPics:string[], closeModal:Function }) {
    const [selectedTrack, setSelectedTrack] = useState(tracks[0] as Collab);
    return <div>
        <div>
            <p className="text-light-gray hover:cursor-pointer" onClick={() => closeModal()}>x</p>
        </div>
        <div>
            <Image src={artistPics[0]} alt={"Artist 1"} width={70} height={70} />
            <p>+</p>
            <Image src={artistPics[1]} alt={"Artist 2"} width={70} height={70} />
        </div>
        <div/>
        <div className="grid grid-cols-4 gap-1 w-72 h-36 overflow-y-scroll">
            {tracks.map((track:Collab) => <div key={track.id}>
                <div className={"overflow-hidden rounded-md" + (track === selectedTrack) ? " border-solid border-green border-2" : ""}>
                    <Image
                    onMouseEnter={() => {
                        setSelectedTrack(track)
                    }}
                    src={track.img.url} alt={track.name} width={30} height={30}/>
                </div>
            </div>
            )}
        </div>
        <div/>
        <div>
            <Image src={selectedTrack.img.url} alt={selectedTrack.name} width={100} height={100}/>
            <p>{selectedTrack.name}</p>
        </div>
    </div>; 
}
