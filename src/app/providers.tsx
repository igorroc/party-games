"use client"

import { ToastContainer } from "react-toastify"

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<>
			<ToastContainer />
			{children}
		</>
	)
}
