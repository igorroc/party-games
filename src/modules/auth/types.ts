import type { UserRole } from "@/generated/prisma/client"

export type CurrentUser = {
	id: string
	name: string
	email: string
	role: UserRole
	createdAt: Date
}
