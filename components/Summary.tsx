import Image from "next/image";
import { useEffect, useState } from "react";
import Button from "./Button";

export default function Summary({ collabStats, topCollabArtists, closeModal, highlightLink } : 
    { collabStats: number[], topCollabArtists: { [artists: string]: number }, closeModal:Function, highlightLink:Function }) {
    const [top5, setTop5] = useState([] as [string, number][]);

    useEffect(() => {
        // TODO: Work around Image URL size limitations for chrome/safari https://stackoverflow.com/questions/695151/data-protocol-url-size-limitations
        // setTimeout(()=>{
        //     setImageUrl(document.getElementsByTagName("canvas")[0].toDataURL("image/png"));
        // }, 300); // timeout to avoid frame where images aren't fully rendered
        setTop5(Object.entries(topCollabArtists)
            .sort(([, a],[, b]) => b-a)
            .slice(0,5));
    }, []);

    return <div className="bg-med-grey bg-opacity-90 rounded-lg backdrop-blur-sm fixed text-center w-96 text-white inset-x-0 mx-auto">
        <div className="w-full fixed">
            <p className="text-light-gray hover:cursor-pointer text-lg float-right text-md mr-3 hover:text-green" onClick={() => closeModal()}>x</p>
        </div>
        <div className="text-3xl font-bold mt-2 mb-1">Collabify Stats</div>
        {/* <div className="h-3 flex justify-center items-center mx-4">
            <div className="w-96 h-0.5 bg-light-gray rounded-2xl"/>
        </div> */}
        <p className="px-5 text-sm">{`Discovered ${collabStats[0]} tracks from ${collabStats[1]} of your followed artists`}</p>
        <div className="h-3 flex justify-center items-center mb-2 mt-0.5 mx-4">
            <div className="w-96 h-0.5 bg-light-gray rounded-2xl"/>
        </div>
        {top5.map((artistCollabs, idx) => {
            const artists = JSON.parse(artistCollabs[0]);
            return <div className="flex items-start hover:text-green hover:cursor-default" key={idx} onMouseEnter={e => highlightLink(artists[0].id, artists[1].id)}>
                <span className="mt-8 mr-3 ml-16">
                    <p className="font-bold text-xl">{`${idx + 1}.`}</p>
                </span>
                <span>
                    <Image className="overflow-hidden rounded-md h-14 w-14" src={artists[0].img} alt={artists[0].name} width={56} height={56} />
                    <p className="text-xs w-14 mt-0.5 mb-3">{artists[0].name}</p>
                </span>
                <span className="mt-3">
                    <p className="font-bold text-xl mx-3 hover:cursor-default">+</p>
                </span>
                <span>
                    <Image className="overflow-hidden rounded-md h-14 w-14" src={artists[1].img} alt={artists[1].name} width={56} height={56} />
                    <p className="text-xs w-14 mt-0.5 mb-2">{artists[1].name}</p>
                </span>
                <span className="mt-3 mx-4">
                    <p className="text-xl">🠊</p>
                </span>
                <span className="mt-1">
                    <p className="text-4xl font-thin">{artistCollabs[1]}</p>
                </span>
            </div>
        })}
        {/* Collab Graph Preview Png */}
        {/* <Image unoptimized src={imageUrl} alt={"Collab Graph"} width={1} height={1} />  */} 
        <div className="w-96 mb-4 mt-1">
            <Button onClick={() => closeModal()} size="md">Explore Collab Graph</Button>
        </div>
    </div>; 
}
