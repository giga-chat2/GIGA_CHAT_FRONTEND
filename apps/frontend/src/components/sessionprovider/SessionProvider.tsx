// @ts-nocheck
"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";

const Session_Provider = ({children}: {children: React.ReactNode}) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default Session_Provider;
