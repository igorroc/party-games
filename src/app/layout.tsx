import type { Metadata } from "next"
import { Bree_Serif, Nunito_Sans } from "next/font/google"

import "./globals.css"
import "react-toastify/dist/ReactToastify.css"
import { Providers } from "./providers"
import { AppFooter, AppHeader } from "@/components/layout"

const displayFont = Bree_Serif({
	subsets: ["latin"],
	weight: "400",
	variable: "--font-display",
})
const bodyFont = Nunito_Sans({
	subsets: ["latin"],
	variable: "--font-body",
})

const appName = process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Mesa de Jogos"

export const metadata: Metadata = {
	metadataBase: new URL("http://localhost:3000"),
	title: {
		default: appName,
		template: `%s | ${appName}`,
	},
	description: "Jogos presenciais guiados por uma tela compartilhada.",
	openGraph: {
		type: "website",
		locale: "pt_BR",
		siteName: appName,
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="pt-BR">
			<body className={`${displayFont.variable} ${bodyFont.variable} font-body`}>
				<Providers>
					<div className="flex min-h-dvh flex-col">
						<AppHeader appName={appName} />
						{children}
						<AppFooter appName={appName} />
					</div>
				</Providers>
			</body>
		</html>
	)
}
