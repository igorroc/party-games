import type { Metadata } from "next"
import { Bree_Serif, Nunito_Sans } from "next/font/google"

import "./globals.css"
import "react-toastify/dist/ReactToastify.css"
import { Providers } from "./providers"
import { AppFooter, AppHeader } from "@/components/layout"
import { Analytics } from "@vercel/analytics/next"
import { appName, siteUrl } from "@/lib/site-url"

const displayFont = Bree_Serif({
	subsets: ["latin"],
	weight: "400",
	variable: "--font-display",
})
const bodyFont = Nunito_Sans({
	subsets: ["latin"],
	variable: "--font-body",
})

export const metadata: Metadata = {
	metadataBase: siteUrl,
	title: {
		default: appName,
		template: `%s | ${appName}`,
	},
	description: "Jogos presenciais guiados por uma tela compartilhada.",
	openGraph: {
		type: "website",
		locale: "pt_BR",
		siteName: appName,
		title: appName,
		description: "Jogos presenciais guiados por uma tela compartilhada.",
		images: [{ url: "/assets/banner.png" }],
	},
	twitter: { card: "summary_large_image", images: ["/assets/banner.png"] },
	icons: { icon: "/favicon.png" },
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
					<Analytics />
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
