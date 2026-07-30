export const MAGICAL_RACE_NAME =
	process.env.NEXT_PUBLIC_MAGICAL_RACE_NAME?.trim() || "Corrida Arcana"

const mode = process.env.MAGICAL_RACE_BRANDING_MODE ?? "original"

if (mode !== "original" && mode !== "licensed") {
	throw new Error("MAGICAL_RACE_BRANDING_MODE must be original or licensed.")
}

export const magicalRaceBrandingMode = mode
