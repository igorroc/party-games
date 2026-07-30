import type { Metadata } from "next"
import { RegisterContent } from "@/components/auth/register-content"
import { appName } from "@/lib/site-url"

export const metadata: Metadata = {
	title: "Criar conta",
	description: `Crie sua conta para acompanhar suas partidas na ${appName}.`,
	robots: { index: false, follow: false },
}

export default function Register() {
	return <RegisterContent />
}
