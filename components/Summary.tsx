import Image from "next/image";
import { useEffect, useState } from "react";

export default function Summary({ collabStats, topCollabArtists, closeModal }: { collabStats: number[], topCollabArtists: { [artists: string]: number }, closeModal:Function }) {
    const [top5, setTop5] = useState([] as [string, number][]); 

    useEffect(() => {
        setTop5(Object.entries(topCollabArtists)
            .sort(([, a],[, b]) => b-a)
            .slice(0,5));
    }, []);

    // TODO -> Refine UI
    return <div className="bg-med-grey rounded-lg fixed text-center w-1/2 h-1/2">
        <p className="text-white">{`Discovered ${collabStats[0]} collabs from ${collabStats[1]} of your favorite artists.`}</p>
        <div>
            {top5.map((artistCollabs) => {
                const artists = JSON.parse(artistCollabs[0]);
                return <div className="inline-block">
                    <span>
                        <Image src={artists[0].img} alt={artists[0].name} width={100} height={100} />
                        {artists[0].name}
                    </span>
                    <span>
                        <p className="text-white">+</p>
                    </span>
                    <span>
                        <Image src={artists[1].img} alt={artists[1].name} width={100} height={100} />
                        {artists[1].name}
                    </span>
                    <span>
                        <p className="text-white">{`: ${artistCollabs[1]}`}</p>
                    </span>
                </div>
            })}
        </div>
        <button onClick={() => closeModal()}>Close</button>
    </div>; 
}
