"use client";

import { useLottie } from "lottie-react";
import sucess from "../../../public/anim/sucess.json";
import { useRouter } from "next/navigation";
import { AppwriteConfig } from "@/app/constants/appwrite_config";
import { useEffect } from "react";

const style = {
  height: 300,
};

export default function Sucess() {
  const appwriteconfig = new AppwriteConfig();
  const router = useRouter(); // Move this above useEffect

  useEffect(() => {
    appwriteconfig.getCurUser();
    setTimeout(() => {
      router.push("/landing");
    }, 2800);
  }, []); // Added dependency array

  const options = {
    animationData: sucess, // Corrected JSON import
    loop: true,
    autoplay: true,
  };

  const { View } = useLottie(options, style);

  return <div className="h-screen flex items-center justify-center">{View}</div>;
}
