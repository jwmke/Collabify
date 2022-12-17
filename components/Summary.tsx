import Image from "next/image";
import { useEffect, useState } from "react";

export default function Summary({ collabStats, topCollabArtists, closeModal }: { collabStats: number[], topCollabArtists: { [artists: string]: number }, closeModal:Function }) {
    const [top5, setTop5] = useState([] as [string, number][]);
    const [imageUrl, setImageUrl] = useState(null as any);

    useEffect(() => {
        setTimeout(()=>{ // TODO: Work around Image URL size limitations https://stackoverflow.com/questions/695151/data-protocol-url-size-limitations
            setImageUrl(document.getElementsByTagName("canvas")[0].toDataURL("image/png"));
        }, 300);
        setTop5(Object.entries(topCollabArtists)
            .sort(([, a],[, b]) => b-a)
            .slice(0,5));
    }, []);

    // TODO -> Refine UI
    return <div className="bg-med-grey rounded-lg fixed text-center w-1/2 h-1/2 text-white top-24">
        <p className="">{`Discovered ${collabStats[0]} collabs from ${collabStats[1]} of your favorite artists.`}</p>
        <div>
            {top5.map((artistCollabs, idx) => {
                const artists = JSON.parse(artistCollabs[0]);
                return <div className="flex" key={idx}>
                    <span>
                        <p className="">{`${idx + 1}. `}</p>
                    </span>
                    <span>
                        <Image src={artists[0].img} alt={artists[0].name} width={60} height={60} />
                        {artists[0].name}
                    </span>
                    <span>
                        <p className="">+</p>
                    </span>
                    <span>
                        <Image src={artists[1].img} alt={artists[1].name} width={60} height={60} />
                        {artists[1].name}
                    </span>
                    <span>
                        <p className="">{`: ${artistCollabs[1]}`}</p>
                    </span>
                </div>
            })}
        </div>
        <Image unoptimized src={imageUrl} alt={"Collab Graph"} width={700} height={400} />
        <button onClick={() => closeModal()}>Close</button>
    </div>; 
}
