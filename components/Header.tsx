import Image from "next/image";
import Button from "./Button";
import { useRouter } from "next/navigation";
import useWindowDimensions from "./hooks/useWindowDimensions";

export default function Header({ headerType }: { headerType: string }) {
    const router = useRouter();
    const { width } = useWindowDimensions();

    const buttonFunction = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("expiresIn");
        localStorage.removeItem("tokenType");
        router.replace('/');
    }

    const exitIcon = <svg className="fill-white hover:fill-green" onClick={buttonFunction} width={30} height={30} version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 384.971 384.971">
        <g>
            <g id="Sign_Out">
                <path d="M180.455,360.91H24.061V24.061h156.394c6.641,0,12.03-5.39,12.03-12.03s-5.39-12.03-12.03-12.03H12.03
           C5.39,0.001,0,5.39,0,12.031V372.94c0,6.641,5.39,12.03,12.03,12.03h168.424c6.641,0,12.03-5.39,12.03-12.03
           C192.485,366.299,187.095,360.91,180.455,360.91z"/>
                <path d="M381.481,184.088l-83.009-84.2c-4.704-4.752-12.319-4.74-17.011,0c-4.704,4.74-4.704,12.439,0,17.179l62.558,63.46H96.279
           c-6.641,0-12.03,5.438-12.03,12.151c0,6.713,5.39,12.151,12.03,12.151h247.74l-62.558,63.46c-4.704,4.752-4.704,12.439,0,17.179
           c4.704,4.752,12.319,4.752,17.011,0l82.997-84.2C386.113,196.588,386.161,188.756,381.481,184.088z"/>
            </g>
        </g>
    </svg>

    return <div className="w-screen flow-root">
        <span className="float-left">
            <Image onClick={() => router.back()} className="pt-3 pl-2 hover:cursor-pointer" width={width <= 480 ? 88 : 100} height={width <= 480 ? 88 : 100} src={"/img/c-s-t.png"} alt="collabify-logo" />
        </span>
        {headerType === "Log Out" ?
            <span className="float-right mr-7 lg:mr-6 mt-9 lg:mt-8">
                {width <= 480 ? exitIcon : <Button onClick={buttonFunction} size="sm">{headerType}</Button>}
            </span>
            : null}
    </div>
}