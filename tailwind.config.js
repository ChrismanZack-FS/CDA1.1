/** @type {import('tailwindcss').Config} */
module.exports = {
	presets: [require("nativewind/preset")],
	content: [
		"./App.{js,jsx,ts,tsx}",
		"./app/**/*.{js,jsx,ts,tsx}",
		"./components/**/*.{js,jsx,ts,tsx}",
	],
	theme: {
		extend: {
			colors: {
				primary: {
					50: "#eff6ff",
					500: "#3b82f6",
					600: "#2563eb",
					700: "#1d4ed8",
				},
				gray: {
					50: "#f9fafb",
					100: "#f3f4f6",
					500: "#6b7280",
					900: "#111827",
				},
			},
			fontFamily: {
				system: ["System"],
			},
		},
	},
	plugins: [],
};
