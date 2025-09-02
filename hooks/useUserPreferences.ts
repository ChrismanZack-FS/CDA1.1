import { useState, useEffect } from "react";
import userPreferencesService from "../services/userPreferences";
export function useUserPreferences() {
	const [preferences, setPreferences] = useState({
		theme: "light" as "light" | "dark",
		notifications: true,
		language: "en",
		username: null as string | null,
	});
	const [loading, setLoading] = useState(true);
	const loadPreferences = async () => {
		try {
			const prefs = await userPreferencesService.getPreferences();
			const username = await userPreferencesService.getUsername();
			setPreferences({ ...prefs, username });
		} catch (error) {
			console.error("Error loading preferences:", error);
		} finally {
			setLoading(false);
		}
	};
	const updatePreferences = async (updates: Partial<typeof preferences>) => {
		try {
			const newPreferences = { ...preferences, ...updates };

			if (updates.username !== undefined) {
				if (updates.username) {
					await userPreferencesService.saveUsername(updates.username);
				}
			}

			const { username, ...prefsToSave } = newPreferences;
			await userPreferencesService.savePreferences(prefsToSave);
			setPreferences(newPreferences);
		} catch (error) {
			console.error("Error saving preferences:", error);
			throw error;
		}
	};
	useEffect(() => {
		loadPreferences();
	}, []);
	return {
		preferences,
		loading,
		updatePreferences,
	};
}
