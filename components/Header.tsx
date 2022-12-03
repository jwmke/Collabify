import Image from "next/image";
import Button from "./Button";
import { useRouter } from "next/navigation";

export default function Header({ headerType }: { headerType:string }) {
    const router = useRouter();

    const buttonFunction = () => {
        if (headerType === "Log Out") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("expiresIn");
            localStorage.removeItem("tokenType");
            router.replace('/');
        } else if (headerType === "Back") {
            router.replace('/home');
        }
    }

    return <div className="w-screen flow-root">
        <span className="float-left">
            <Image className="pt-3 pl-2" width={100} height={100} src={"/img/c-s-t.png"} alt="collabify-logo"/>
        </span>
        <span className="float-right mr-6 mt-8">
            <Button onClick={buttonFunction} size="sm">{headerType}</Button>
        </span>
    </div>
}