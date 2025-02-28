import type { Config } from "tailwindcss";
import { withUt } from "uploadthing/tw";

export default withUt({
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontSize: {
				xs: ["0.75rem", { lineHeight: "1.125rem", letterSpacing: "0.01em" }], // 12px
				sm: ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.01em" }], // 14px
				base: ["1rem", { lineHeight: "1.5rem", letterSpacing: "0.01em" }], // 16px
				lg: ["1.125rem", { lineHeight: "1.75rem", letterSpacing: "0.01em" }], // 18px
				xl: ["1.25rem", { lineHeight: "1.75rem", letterSpacing: "-0.01em" }], // 20px
				"2xl": ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.015em" }], // 24px
				"3xl": ["1.875rem", { lineHeight: "2.25rem", letterSpacing: "-0.02em" }], // 30px
				"4xl": ["2.25rem", { lineHeight: "2.5rem", letterSpacing: "-0.025em" }], // 36px
				"5xl": ["3rem", { lineHeight: "3.5rem", letterSpacing: "-0.03em" }], // 48px
				"6xl": ["3.75rem", { lineHeight: "4rem", letterSpacing: "-0.035em" }], // 60px
				"fluid-heading": {
					fontSize: "clamp(2.5rem, 8vw + 1rem, 4.5rem)",
					lineHeight: "1.1",
					letterSpacing: "-0.05em",
				},
			},
			fontFamily: {
				outfit: ["Outfit", "sans-serif"],
			},
			backgroundImage: {
				"impact-gradient": "linear-gradient(to right, #000910 0%, rgba(255, 255, 255, 0.58) 19%, #304251 75%, #32383D 100%)",
				"impact-gradient-up": "linear-gradient(to top, #000910 0%, rgba(255, 255, 255, 0.58) 19%, #304251 75%, #32383D 100%)",
				"card-gradient": "linear-gradient(to top right, #1E1E1E 5%, #1a252d 100%)",
			},
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				customTeal: "#54F4FC",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					"1": "hsl(var(--chart-1))",
					"2": "hsl(var(--chart-2))",
					"3": "hsl(var(--chart-3))",
					"4": "hsl(var(--chart-4))",
					"5": "hsl(var(--chart-5))",
				},
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-background))",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
		},
	},
	plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar")],
}) satisfies Config;
