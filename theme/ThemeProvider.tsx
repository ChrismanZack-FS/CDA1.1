import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { designTokens } from "./designTokens";
interface Theme {
	colors: typeof designTokens.colors & {
		background: string;
		surface: string;
		text: {
			primary: string;
			secondary: string;
			disabled: string;
		};
	};
	spacing: typeof designTokens.spacing;
	typography: typeof designTokens.typography;
	breakpoints: typeof designTokens.breakpoints;
	mode: "light" | "dark";
}
interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
	setTheme: (mode: "light" | "dark") => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export const useTheme = (): ThemeContextType => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
};
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const systemColorScheme = useColorScheme();
	const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
	const { colors, spacing, typography, breakpoints } = designTokens;
	// Load saved theme preference
	useEffect(() => {
		const loadTheme = async () => {
			try {
				const savedTheme = await AsyncStorage.getItem("app_theme");
				if (savedTheme) {
					setThemeMode(savedTheme as "light" | "dark");
				} else {
					// Use system preference as default
					setThemeMode(systemColorScheme || "light");
				}
			} catch (error) {
				console.error("Failed to load theme preference:", error);
			}
		};
		loadTheme();
	}, [systemColorScheme]);
	// Create theme object with mode-specific overrides
	const theme: Theme = {
		colors: {
			...colors,
			// Override colors based on theme mode
			background:
				themeMode === "dark" ? colors.neutral[900] : colors.neutral[50],
			surface: themeMode === "dark" ? colors.neutral[900] : colors.neutral[100],
			text: {
				primary:
					themeMode === "dark" ? colors.neutral[50] : colors.neutral[900],
				secondary:
					themeMode === "dark" ? colors.neutral[500] : colors.neutral[100],
				disabled:
					themeMode === "dark" ? colors.neutral[900] : colors.neutral[500],
			},
		},
		spacing,
		typography,
		breakpoints,
		mode: themeMode,
	};
	const toggleTheme = async () => {
		const newMode = themeMode === "light" ? "dark" : "light";
		setThemeMode(newMode);
		try {
			await AsyncStorage.setItem("app_theme", newMode);
		} catch (error) {
			console.error("Failed to save theme preference:", error);
		}
	};
	const setTheme = async (mode: "light" | "dark") => {
		setThemeMode(mode);
		try {
			await AsyncStorage.setItem("app_theme", mode);
		} catch (error) {
			console.error("Failed to save theme preference:", error);
		}
	};
	return (
		<ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};
