import type { MetadataRoute } from "next"
import { siteUrl } from "@/lib/site-url"

const publicPages = ["/", "/games", "/games/nem-a-pato", "/games/magical-race"]

export default function sitemap(): MetadataRoute.Sitemap {
	return publicPages.map((path) => ({
		url: new URL(path, siteUrl).toString(),
	}))
}
