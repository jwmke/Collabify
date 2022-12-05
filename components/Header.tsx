import Image from "next/image";
import Button from "./Button";
import { useRouter } from "next/navigation";

export default function Header({ headerType }: { headerType:string }) {
    const router = useRouter();

    const buttonFunction = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("expiresIn");
        localStorage.removeItem("tokenType");
        router.replace('/');
    }

    return <div className="w-screen flow-root">
        <span className="float-left">
            <Image onClick={() => router.back()} className="pt-3 pl-2 hover:cursor-pointer" width={100} height={100} src={"/img/c-s-t.png"} alt="collabify-logo"/>
        </span>
        {headerType === "Log Out" ? 
            <span className="float-right mr-6 mt-8">
                <Button onClick={buttonFunction} size="sm">{headerType}</Button>
            </span>
        : null}
    </div>
}