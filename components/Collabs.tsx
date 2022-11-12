import Image from "next/image";

// export default function Collabs({ collabs }:{ collabs:SpotifyApi.TrackObjectFull[] }) {
//     return <div>
//         <p>COLLABS</p>
//         <div>{collabs.map((track:SpotifyApi.TrackObjectFull)=>{
//             return <div>
//                 <div>{track.name}</div>
//                 {/* TODO: Get pictures of artists who collabed for this track */}
//             </div>;
//         })}</div>
//     </div>;
// }

// for testing, todo: remove later
export default function Collabs({ collabs }:{ collabs:string[] }) {
    return <div>
        <p>COLLABS</p>
        <div>{collabs.map((track:string)=>{
            return <div key={track}>
                <div>{track}</div>
                {/* TODO: Get pictures of artists who collabed for this track */}
            </div>;
        })}</div>
    </div>;
}