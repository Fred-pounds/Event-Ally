// "use client";

// import { useEffect } from "react";
// import { useLottie } from "lottie-react";
// import error from "../../../public/anim/error.json";
// import { useRouter } from "next/navigation";

// const style = {
//   height: 300,
// };

// export default function Failure() {
//   const router = useRouter();

//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       router.push("/login");
//     }, 3000);

//     return () => clearTimeout(timeout); // Cleanup on unmount
//   }, [router]);

//   const options = {
//     animationData: error,
//     loop: true,
//     autoplay: true,
//   };

//   const { View } = useLottie(options, style);

//   return (
//     <div className="h-screen flex items-center justify-center">
//       {View}
//     </div>
//   );
// }
