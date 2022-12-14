import Image from "next/image";
import { useEffect, useState } from "react";
import { Collab } from "../custom-types";

export default function Preview({ tracks, artistPics, closeModal, artistNames }: { tracks:Collab[], artistPics:string[], artistNames:string[], closeModal:Function }) {
    const [selectedTrack, setSelectedTrack] = useState(tracks[0] as Collab);

    useEffect(() => {
        setSelectedTrack(tracks[0]);
    }, [tracks]);

    return <div className="bg-med-grey bg-opacity-90 rounded-lg backdrop-blur-sm w-72">
        <div className="w-full">
            <p className="text-light-gray hover:cursor-pointer text-lg float-right text-md mr-3 hover:text-green" onClick={() => closeModal()}>x</p>
        </div>
        <div className="w-72 h-32 flex justify-center items-center">
            <div className="text-center">
                <Image className="inline-block hw100 rounded-md" src={artistPics[0]} alt={"Artist 1"} width={100} height={100} />
                <div className="w-24 mt-1 -mb-1">
                    <p className="text-white text-sm truncate">{artistNames[0]}</p>
                </div>
            </div>
            <p className="inline-block -mt-5 text-white font-bold text-xl mx-3 hover:cursor-default">+</p>
            <div className="text-center">
                <Image className="inline-block align-middle hw100 rounded-md" src={artistPics[1]} alt={"Artist 2"} width={100} height={100} />
                <div className="w-24 mt-1 -mb-1">
                    <p className="text-white text-sm truncate">{artistNames[1]}</p>
                </div>
            </div>
        </div>
        <div className="h-3 flex justify-center items-center mb-2">
            <div className="w-64 h-0.5 bg-light-gray rounded-2xl"/>
        </div>
        <div className="grid grid-cols-5 gap-2 w-64 mx-4 max-h-96 overflow-auto">
            {tracks.map((track:Collab) => <div key={track.id}>
                <div className={"overflow-hidden rounded-md" + ((track === selectedTrack) ? " border-solid border-green border-2" : "")}>
                    <Image
                    onMouseEnter={() => {
                        setSelectedTrack(track)
                    }}
                    src={track.img.url} alt={track.name} width={51} height={51}/>
                </div>
            </div>
            )}
        </div>
        <div className="h-3 flex justify-center items-center mb-2 mt-1.5">
            <div className="w-64 h-0.5 bg-light-gray rounded-2xl"/>
        </div>
        <div className="w-72 text-center pb-2">
            <Image className="rounded-lg mx-auto my-1" src={selectedTrack.img.url} alt={selectedTrack.name} width={150} height={150}/>
            <p className="text-white mx-4">{selectedTrack.name}</p>
        </div>
    </div>; 
}
