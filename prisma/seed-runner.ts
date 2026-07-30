import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"
import { seedDatabase } from "./seed"

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.POSTGRES_PRISMA_URL }),
})

seedDatabase(prisma).finally(async () => {
	await prisma.$disconnect()
})
