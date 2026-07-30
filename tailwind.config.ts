import type { Config } from "tailwindcss"

const config: Config = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./node_modules/@heroui/react/dist/**/*.{js,ts,jsx,tsx}",
		"./node_modules/@heroui/styles/dist/**/*.{js,ts,jsx,tsx}",
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
	plugins: [],
}
export default config
