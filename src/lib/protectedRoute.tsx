// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { supabase } from "./supabase";
// import { Session } from "@supabase/supabase-js";
// import Splash from "@/components/Splash";
// const requireAuth = <P extends object>(
//   WrappedComponent: React.ComponentType<P>
// ) => {
//   return (props: P) => {
//     const [loading, setLoading] = useState(true);
//     const [session, setSession] = useState<Session | null>(null);
//     const router = useRouter();

//     useEffect(() => {
//       const getSession = async () => {
//         const { data, error } = await supabase.auth.getSession();
//         if (error || !data.session) {
//           console.log(data);
//           router.push("/login");
//         } else {
//           setSession(data.session);
//           setLoading(false);
//         }
//       };

//       getSession();
//     }, [router]);

//     if (loading) {
//       return <Splash />;
//     }

//     return <WrappedComponent session={session} {...props} />;
//   };
// };

// export default requireAuth;
