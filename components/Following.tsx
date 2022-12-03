import Image from "next/image";
import { useState } from "react";
import Button from "./Button";
import Header from "./Header";

export default function Following({ following, findCollabs }: { following: SpotifyApi.ArtistObjectFull[], findCollabs: Function }) {
    const artistIds = following.map(artist => artist.id);
    const [selectedIds, setSelectedIds] = useState(artistIds as string[]);

    return <div className="h-screen bg-dark-gray font-lato">
        <Header headerType="Log Out"/>
        <h1 className="text-white font-bold text-4xl text-center -mt-6">Followed Artists</h1>
        <p className="text-white text-center mt-1 text-sm">
            Select one or more artists to find their collabs.<br />
            To find all collabs, don't select any artists.
        </p>
        <div className="w-1/2 mx-auto grid grid-cols-5 gap-8 mt-3 h-2/3 overflow-y-scroll">
            {following.map((artist: SpotifyApi.ArtistObjectFull) => {
                return <div key={artist.id}>
                    <div className={"hw160 overflow-hidden rounded-lg" + (selectedIds.includes(artist.id) ? " border-solid border-green border-2" : "")}>
                        <Image className={"hover:cursor-pointer hover:scale-110 transition ease-in-out duration-150" +
                            (selectedIds.includes(artist.id) ? "" : " grayscale")}
                            onClick={() => {
                                if (selectedIds.length === artistIds.length) {
                                    setSelectedIds([artist.id]);
                                } else {
                                    if (selectedIds.includes(artist.id)) {
                                        setSelectedIds(selectedIds.filter((item: string) => item !== artist.id));
                                        if (selectedIds.length === 1) {
                                            setSelectedIds(artistIds);
                                        }
                                    } else {
                                        setSelectedIds([artist.id, ...selectedIds]);
                                    }
                                }
                            }}
                            src={artist.images[2].url} alt={artist.name} width={160} height={160} />
                    </div>
                    <div className="text-white font-bold text-md text-center mt-1">{artist.name}</div>
                </div>
            })}
        </div>
        <div className="mx-auto w-1/2 flex justify-center">
            <span className="w-80 mt-5 mx-5 inline-block">
                <Button onClick={() => findCollabs(selectedIds, "follow")} size="lg">
                    Find Collabs
                </Button>
            </span>
            {/* <span className="w-80 mt-5 mx-5 inline-block">
                <Button onClick={() => findCollabs(selectedIds, "all")} size="lg" tooltip="All tracks that selected artists appear on.">
                    Find All Collabs
                </Button>
            </span> */}
        </div>
    </div>;
}