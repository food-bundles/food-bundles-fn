"use client";

import { ImageKitProvider as IKProvider } from "@imagekit/next";

export function ImageKitProvider({ children }: { children: React.ReactNode }) {
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!urlEndpoint) {
    console.warn("ImageKit URL endpoint not configured, falling back to regular images");
    return <>{children}</>;
  }

  return (
    <IKProvider urlEndpoint={urlEndpoint}>
      {children}
    </IKProvider>
  );
}