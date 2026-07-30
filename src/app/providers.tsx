"use client"

import { ToastContainer } from "react-toastify"

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<>
			<ToastContainer
				position="bottom-right"
				autoClose={9000}
				pauseOnHover
				closeOnClick={false}
				stacked
				limit={5}
			/>
			{children}
		</>
	)
}
