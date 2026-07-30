import "server-only"

import db from "@/lib/db"

const OPERATIONAL_SETTINGS_ID = "global"

export type OperationalSettings = {
	attackModeEnabled: boolean
	updatedAt: string | null
}

export class OperationalSettingsService {
	static async get(): Promise<OperationalSettings> {
		const settings = await db.operationalSettings.findUnique({
			where: { id: OPERATIONAL_SETTINGS_ID },
			select: { attackModeEnabled: true, updatedAt: true },
		})
		return {
			attackModeEnabled: settings?.attackModeEnabled ?? false,
			updatedAt: settings?.updatedAt.toISOString() ?? null,
		}
	}

	static async setAttackMode(attackModeEnabled: boolean, updatedByUserId: string) {
		const settings = await db.operationalSettings.upsert({
			where: { id: OPERATIONAL_SETTINGS_ID },
			create: { id: OPERATIONAL_SETTINGS_ID, attackModeEnabled, updatedByUserId },
			update: { attackModeEnabled, updatedByUserId },
			select: { attackModeEnabled: true, updatedAt: true },
		})
		return {
			attackModeEnabled: settings.attackModeEnabled,
			updatedAt: settings.updatedAt.toISOString(),
		}
	}
}
