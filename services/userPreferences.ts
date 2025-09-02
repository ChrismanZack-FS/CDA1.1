import secureStorage from "./secureStorage";
interface UserPreferences {
	theme: "light" | "dark";
	notifications: boolean;
	language: string;
	username?: string;
}
class UserPreferencesService {
	private readonly PREFERENCES_KEY = "user_preferences";
	private readonly USERNAME_KEY = "username";
	async savePreferences(preferences: UserPreferences): Promise<void> {
		try {
			await secureStorage.setItem(
				this.PREFERENCES_KEY,
				JSON.stringify(preferences)
			);
		} catch (error) {
			console.error("Error saving preferences:", error);
			throw error;
		}
	}
	async getPreferences(): Promise<UserPreferences> {
		try {
			const preferencesStr = await secureStorage.getItem(this.PREFERENCES_KEY);
			if (preferencesStr) {
				return JSON.parse(preferencesStr);
			}

			// Return default preferences
			return {
				theme: "light",
				notifications: true,
				language: "en",
			};
		} catch (error) {
			console.error("Error loading preferences:", error);
			// Return defaults on error
			return {
				theme: "light",
				notifications: true,
				language: "en",
			};
		}
	}
	async saveUsername(username: string): Promise<void> {
		await secureStorage.setItem(this.USERNAME_KEY, username);
	}
	async getUsername(): Promise<string | null> {
		return await secureStorage.getItem(this.USERNAME_KEY);
	}
	async clearUserData(): Promise<void> {
		await secureStorage.deleteItem(this.PREFERENCES_KEY);
		await secureStorage.deleteItem(this.USERNAME_KEY);
	}
}
export default new UserPreferencesService();
