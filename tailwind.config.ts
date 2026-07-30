import type { Config } from "tailwindcss"
import { nextui } from "@nextui-org/react"

const config: Config = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			fontFamily: {
				body: ["var(--font-body)", "sans-serif"],
				display: ["var(--font-display)", "serif"],
			},
			colors: {
				background: "rgb(var(--color-background) / <alpha-value>)",
				foreground: "rgb(var(--color-foreground) / <alpha-value>)",
				surface: "rgb(var(--color-surface) / <alpha-value>)",
				"surface-strong": "rgb(var(--color-surface-strong) / <alpha-value>)",
				primary: "rgb(var(--color-primary) / <alpha-value>)",
				"primary-hover": "rgb(var(--color-primary-hover) / <alpha-value>)",
				secondary: "rgb(var(--color-secondary) / <alpha-value>)",
				accent: "rgb(var(--color-accent) / <alpha-value>)",
				danger: "rgb(var(--color-danger) / <alpha-value>)",
				muted: "rgb(var(--color-muted) / <alpha-value>)",
				border: "rgb(var(--color-border) / <alpha-value>)",
				focus: "rgb(var(--color-focus) / <alpha-value>)",
				success: "rgb(var(--color-success) / <alpha-value>)",
			},
		},
	},
	darkMode: "class",
	plugins: [
		nextui({
			themes: {
				light: {
					colors: {
						background: "#F4EBDD",
						foreground: "#202822",
						primary: { foreground: "#FFF9EE", DEFAULT: "#245B49" },
						secondary: { foreground: "#202822", DEFAULT: "#E4AA3A" },
						danger: { foreground: "#FFF9EE", DEFAULT: "#B7423A" },
						focus: "#326FDF",
					},
				},
			},
		}),
	],
}
export default config
