"use client"

import { NextUIProvider } from "@nextui-org/react"
import { ToastContainer } from "react-toastify"

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<NextUIProvider>
			<ToastContainer />
			{children}
		</NextUIProvider>
	)
}
