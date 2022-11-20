"use client";
import { useEffect } from 'react';
import { useRouter } from "next/navigation";
import Loading from '../../components/Loading';

const getReturnedParamsFromSpotifyAuth = (hash: string) => {
    const stringAfterHashtag = hash.substring(1);
    const paramsInUrl = stringAfterHashtag.split("&");
    const paramsSplitUp = paramsInUrl.reduce((accumulater: Record<string, string>, currentValue) => {
      const [key, value] = currentValue.split("=");
      accumulater[key] = value;
      return accumulater;
    }, {});
  
    return paramsSplitUp;
};

export default function Page() {
    const router = useRouter();

    useEffect(()=>{
        let hash:string = window && window.location.hash;
        if (hash) {
            const { access_token, expires_in, token_type } = getReturnedParamsFromSpotifyAuth(hash);
  
            localStorage.setItem("accessToken", access_token);
            localStorage.setItem("expiresIn", expires_in);
            localStorage.setItem("tokenType", token_type);
            router.replace('/home');
        }
    }, []);

    return <Loading>Loading...</Loading>
}