import Image from "next/image";
import Button from "./Button";
import { useRouter } from "next/navigation";

export default function Headers() {
    const router = useRouter();

    const logOut = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("expiresIn");
        localStorage.removeItem("tokenType");
        router.replace('/');
    }

    return <div className="w-screen flow-root">
        <span className="float-left">
            <Image className="pt-3 pl-2" width={100} height={100} src={"/img/c-s-t.png"} alt="collabify-logo"/>
        </span>
        <span className="float-right mr-6 mt-8">
            <Button onClick={logOut} size="sm">Log Out</Button>
        </span>
    </div>
}