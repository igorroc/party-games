const fallbackSiteUrl = "https://party-games.ilrocha.com"

export const appName = process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Party Games"
export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL?.trim() || fallbackSiteUrl)
