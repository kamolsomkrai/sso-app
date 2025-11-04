"use client"

import { SessionProvider } from "next-auth/react"
import React from "react"

type Props = {
  children: React.ReactNode
}

// นี่คือ Component ที่จะหุ้มแอปของคุณใน layout
export const NextAuthProvider = ({ children }: Props) => {
  return <SessionProvider>{children}</SessionProvider>
}