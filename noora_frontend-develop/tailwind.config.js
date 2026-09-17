const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		extend: {
			colors: {
				border: "hsl(var(--border))",
				saffron: "#EF9B20",
				darkblue: "#0A263B",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},

				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
					50: "#e9ecf4",
					100: "#d2d9e8",
					200: "#a6b3d2",
					300: "#798dbb",
					400: "#4d67a5",
					450: "#365499",
					500: "#20418e",
					550: "#1d3b80",
					600: "#1a3472",
					700: "#132755",
					800: "#0d1a39",
					900: "#060d1c",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				info: colors.blue,
				warning: colors.yellow,
				danger: colors.red,
			},

			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
				"4xl": "2rem",
			},

			keyframes: {
				"accordion-down": {
					from: { height: 0 },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: 0 },
				},
				"caret-blink": {
					"0%,70%,100%": { opacity: "1" },
					"20%,50%": { opacity: "0" },
				},
			},

			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"caret-blink": "caret-blink 1.25s ease-out infinite",
			},

			fontFamily: {
				sans: ["var(--font-family-vazirmatn)"],
				serif: ["var(--font-family-vazirmatn)"],
			},

			fontSize: {
				"2xs": ["0.625rem", "0.75rem"],
				xsm: ["0.813rem", "1.25rem"],
			},

			maxWidth: {
				12: "22rem",
				35: "35rem",
				24: "24rem",
				7: "7rem",
				6: "6rem",
			},

			backgroundImage: {
				"gradient-blue":
					"linear-gradient(to right bottom, #264798, #2e4f9f, #3657a7, #3d5fae, #4567b5)",
			},

			screens: {
				xs: "425px",
				"3xl": "1920px",
			},

			width: {
				"a4-portrait": "21cm",
			},

			maxWidth: {
				"a4-portrait": "21cm",
			},
		},

		variants: {
			extend: {
				display: ["group-hover"],
			},
		},
	},
	plugins: [
		require("tailwindcss-animate"),
		require("@tailwindcss/forms")({ strategy: "class" }),
		require("@tailwindcss/typography"),
	],
};
