import { Platform } from "react-native";
export const designTokens = {
	colors: {
		primary: {
			50: "#f0f9ff",
			500: "#3b82f6",
			900: "#1e3a8a",
		},
		neutral: {
			50: "#f9fafb",
			100: "#f3f4f6",
			500: "#6b7280",
			900: "#111827",
		},
		semantic: {
			success: "#10b981",
			warning: "#f59e0b",
			error: "#ef4444",
			info: "#3b82f6",
		},
	},
	spacing: {
		xs: 4,
		sm: 8,
		md: 16,
		lg: 24,
		xl: 32,
		"2xl": 48,
		"3xl": 64,
	},
	typography: {
		fontFamily: {
			sans: Platform.select({
				ios: "SF Pro Display",
				android: "Roboto",
				web: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
				default: "System",
			}),
		},
		fontSize: {
			xs: 12,
			sm: 14,
			base: 16,
			lg: 18,
			xl: 20,
			"2xl": 24,
			"3xl": 30,
			"4xl": 36,
		},
		lineHeight: {
			tight: 1.25,
			normal: 1.5,
			relaxed: 1.75,
		},
	},
	borderRadius: {
		sm: 4,
		md: 8,
		lg: 12,
		xl: 16,
		full: 9999,
	},
	shadows: {
		sm: Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 1 },
				shadowOpacity: 0.05,
				shadowRadius: 2,
			},
			android: {
				elevation: 2,
			},
			web: {
				boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
			},
		}),
		md: Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 4 },
				shadowOpacity: 0.1,
				shadowRadius: 6,
			},
			android: {
				elevation: 4,
			},
			web: {
				boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
			},
		}),
	},
};
// Platform-specific adaptations
export const platformAdaptations = {
	touchTargets: {
		minimum: Platform.select({
			ios: 44,
			android: 48,
			web: 44,
			default: 44,
		}),
	},
	animations: {
		duration: Platform.select({
			ios: 300,
			android: 250,
			web: 200,
			default: 250,
		}),
		easing: Platform.select({
			ios: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
			android: "cubic-bezier(0.4, 0.0, 0.2, 1)",
			web: "cubic-bezier(0.4, 0.0, 0.2, 1)",
			default: "ease-out",
		}),
	},
	interactions: {
		hapticFeedback: Platform.OS !== "web",
		hoverStates: Platform.OS === "web",
		contextMenus: Platform.OS === "web",
		swipeGestures: Platform.OS !== "web",
	},
};
