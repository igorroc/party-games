import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthSession } from "@/modules/auth"

export const metadata: Metadata = {
	title: "Administração",
	robots: { index: false, follow: false },
}

export default async function AdminPage() {
	await AuthSession.requireAdmin()
	redirect("/admin/questions")
}
