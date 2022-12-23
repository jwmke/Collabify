import Image from "next/image";
import { useState } from "react";
import Button from "./Button";
import Header from "./Header";
import useWindowDimensions from "./hooks/useWindowDimensions";

export default function Following({ following, findCollabs }: { following: SpotifyApi.ArtistObjectFull[], findCollabs: Function }) {
    const artistIds = following.map(artist => artist.id);
    const [selectedIds, setSelectedIds] = useState(artistIds as string[]);
    const { width } = useWindowDimensions();
    const mobile = width <= 480; 

    return <div className="h-screen bg-dark-gray font-lato">
        <Header headerType="Log Out"/>
        <h1 className="text-white font-bold text-4xl text-center mt-2 md:-mt-6">Followed Artists</h1>
        <p className="text-white text-center mt-2 md:text-sm" style={{"fontSize": ".7rem"}}>
            Select one or more artists to find their collabs. All artists are selected by default.
        </p>
        <div className="w-3/4 lg:w-1/2 mx-auto grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5 lg:gap-8 mt-4 lg:mt-3 h-1/2 md:h-2/3 overflow-auto">
            {following.map((artist: SpotifyApi.ArtistObjectFull) => {
                return <div key={artist.id}>
                    <div className={`${mobile ? "hw60" : "hw160"} overflow-hidden mx-auto rounded-lg shadow-black shadow-lg ${selectedIds.includes(artist.id) ? "border-solid border-green border-2" : ""}`}>
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
                            src={artist.images[2].url} alt={artist.name} width={mobile ? 60 : 160} height={mobile ? 60 : 160} />
                    </div>
                    <div className="text-white font-bold text-xs lg:text-md mx-auto text-center mt-1 w-16 lg:w-40 h-4 truncate">{artist.name}</div>
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