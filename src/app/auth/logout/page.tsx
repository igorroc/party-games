import type { Metadata } from "next"
import { LogoutContent } from "@/components/auth/logout-content"
import { appName } from "@/lib/site-url"

export const metadata: Metadata = {
	title: "Sair",
	description: `Encerre sua sessão na ${appName}.`,
	robots: { index: false, follow: false },
}

type LogoutPageProps = {
	searchParams: Promise<{
		reason?: string
	}>
}

export default async function Logout({ searchParams }: LogoutPageProps) {
	const { reason } = await searchParams

	return <LogoutContent isExpired={reason === "expired"} />
}
