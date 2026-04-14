"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    console.log("CLIENT ID:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      {children}
    </GoogleOAuthProvider>
  );
}