import Image from "next/image";

export default function Following({ following }:{ following:any }) {
    return <div>
        <p>FOLLOWING</p>
        <div>{following.map((artist:any)=>{
            return <div>
                <div>{artist.name}</div>
                <Image src={artist.images[2].url} alt={artist.name} width={160} height={160}/>
            </div>;
        })}</div>
    </div>;
}