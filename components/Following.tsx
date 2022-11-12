import Image from "next/image";

export default function Following({ following, findCollabs }:{ following:SpotifyApi.ArtistObjectFull[], findCollabs:Function }) {
    return <div>
        <p>FOLLOWING</p>
        <button onClick={() => findCollabs()}>Get Collabs</button>
        <div>{following.map((artist:SpotifyApi.ArtistObjectFull)=>{
            return <div key={artist.name}>
                <div>{artist.name}</div>
                <Image src={artist.images[2].url} alt={artist.name} width={160} height={160}/>
            </div>;
        })}</div>
    </div>;
}