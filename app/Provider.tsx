"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import { GOOGLE_CLIENT_ID } from "@/lib/config";
import { useEffect } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.error(
        "[QFind Auth Error]: NEXT_PUBLIC_GOOGLE_CLIENT_ID no está definido en las variables de entorno. Google Login devolverá 'Missing required parameter: client_id'."
      );
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Toaster position="top-right" reverseOrder={false} />
      {children}
    </GoogleOAuthProvider>
  );
}