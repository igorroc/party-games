"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Avatar, Button, Menu, Popover } from "@heroui/react"

import type { CurrentUser } from "@/modules/auth"
import { ApiClient } from "@/lib/api/api-client"
import { TypeGuard } from "@/lib/api/api-result"

type UserMenuProps = {
	user: CurrentUser
}

export function UserMenu({ user }: UserMenuProps) {
	const initial = user.name.trim().charAt(0).toUpperCase() || "U"
	const router = useRouter()
	const [isLoggingOut, setIsLoggingOut] = useState(false)
	const [isOpen, setIsOpen] = useState(false)

	async function logout() {
		if (isLoggingOut) return

		setIsLoggingOut(true)
		setIsOpen(false)
		const result = await ApiClient.logout()
		if (TypeGuard.isFailure(result)) {
			setIsLoggingOut(false)
			return
		}

		router.replace("/")
		router.refresh()
	}

	function handleAction(key: React.Key) {
		setIsOpen(false)
		if (key === "logout") {
			void logout()
			return
		}

		router.push(key === "profile" ? "/profile" : "/admin")
	}

	return (
		<Popover isOpen={isOpen} onOpenChange={setIsOpen}>
			<Popover.Trigger>
				<Button
					variant="outline"
					className="border-border bg-surface hover:bg-surface-strong h-auto gap-2 px-2 py-1.5"
				>
					<Avatar size="sm" className="bg-secondary text-foreground">
						<Avatar.Fallback>{initial}</Avatar.Fallback>
					</Avatar>
					<span className="text-foreground hidden max-w-32 truncate text-sm font-extrabold sm:block">
						{user.name}
					</span>
				</Button>
			</Popover.Trigger>
			<Popover.Content
				placement="bottom end"
				className="border-border bg-surface w-64 rounded-xl border p-2 shadow-[5px_5px_0_rgb(var(--color-primary)/0.14)]"
			>
				<Popover.Dialog>
					<div className="border-border border-b px-3 py-2">
						<p className="text-foreground truncate font-bold">{user.name}</p>
						<p className="text-muted truncate text-sm">{user.email}</p>
					</div>
					<Menu aria-label="Menu da conta" className="mt-1" onAction={handleAction}>
						<Menu.Item id="profile">Meu perfil</Menu.Item>
						{user.role === "ADMIN" && <Menu.Item id="admin">Administração</Menu.Item>}
						<Menu.Item id="logout" variant="danger" isDisabled={isLoggingOut}>
							{isLoggingOut ? "Saindo..." : "Sair"}
						</Menu.Item>
					</Menu>
				</Popover.Dialog>
			</Popover.Content>
		</Popover>
	)
}
