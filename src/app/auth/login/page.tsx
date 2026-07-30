import type { Metadata } from "next"
import { LoginContent } from "@/components/auth/login-content"

export const metadata: Metadata = {
	title: "Entrar",
	description: "Entre na sua conta para acessar seu perfil e suas partidas.",
	robots: { index: false, follow: false },
}

export default function Login() {
	return <LoginContent />
}
