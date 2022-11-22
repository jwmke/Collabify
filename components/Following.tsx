import Image from "next/image";
import Button from "./Button";
import Header from "./Header";

export default function Following({ following, findCollabs }:{ following:SpotifyApi.ArtistObjectFull[], findCollabs:Function }) {
    return <div className="h-screen bg-dark-gray font-lato">
        <Header/>
        <h1 className="text-white font-bold text-4xl text-center">Followed Artists</h1>
        <div className="w-1/2 mx-auto grid grid-cols-5 gap-4 mt-5 h-2/3 overflow-y-scroll">
            {following.map((artist:SpotifyApi.ArtistObjectFull)=>{
                return <div key={artist.name}>
                    <div className="hw160 overflow-hidden rounded-md">
                        <Image src={artist.images[2].url} alt={artist.name} width={160} height={160}/>
                    </div>
                    <div className="text-white font-bold text-md text-center mt-1">{artist.name}</div>
                </div>;
            })}
        </div>
        <div className="mx-auto w-80 mt-8">
            <Button onClick={() => findCollabs()} size="lg">Find Collabs</Button>
        </div>
    </div>;
}