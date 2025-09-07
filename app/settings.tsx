// app/settings.tsx
import React, { useState, useEffect, useLayoutEffect } from "react";
import {
	View,
	Text,
	TextInput,
	Switch,
	TouchableOpacity,
	StyleSheet,
} from "react-native";
import { useUserPreferences } from "../hooks/useUserPreferences";
import { Colors } from "../constants/Colors";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";

export default function SettingsScreen() {
	const { preferences, loading, updatePreferences } = useUserPreferences();
	const [username, setUsername] = useState(preferences.username || "");
	const [theme, setTheme] = useState<"light" | "dark">(preferences.theme);
	const router = useRouter();
	const navigation = useNavigation();

	useLayoutEffect(() => {
		navigation.setOptions({
			headerStyle: { backgroundColor: Colors[theme].background },
			headerTintColor: Colors[theme].text,
			headerTitleStyle: { color: Colors[theme].text },
		});
	}, [navigation, theme]);

	useEffect(() => {
		// Ensure local state updates if preferences change
		setUsername(preferences.username || "");
		setTheme(preferences.theme);
	}, [preferences]);

	if (loading) {
		return (
			<View
				style={[styles.centered, { backgroundColor: Colors[theme].background }]}
			>
				<Text style={{ color: Colors[theme].text }}>
					Loading preferences...
				</Text>
			</View>
		);
	}

	const handleSave = async () => {
		await updatePreferences({
			username,
			theme,
		});
		// Navigate back to index and pass updated username
		router.replace({ pathname: "/", params: { username } });
	};

	return (
		<View
			style={[styles.container, { backgroundColor: Colors[theme].background }]}
		>
			<Text style={[styles.header, { color: Colors[theme].text }]}>
				Settings
			</Text>

			{/* Username */}
			<View style={styles.section}>
				<Text style={[styles.label, { color: Colors[theme].text }]}>
					Username
				</Text>
				<TextInput
					value={username}
					onChangeText={setUsername}
					placeholder="Enter your name"
					placeholderTextColor={Colors[theme].icon}
					style={[
						styles.input,
						{ backgroundColor: Colors[theme].tint, color: Colors[theme].text },
					]}
				/>
			</View>

			{/* Theme toggle */}
			<View style={styles.sectionRow}>
				<Text style={[styles.label, { color: Colors[theme].text }]}>
					Dark Mode
				</Text>
				<Switch
					value={theme === "dark"}
					onValueChange={(val) => setTheme(val ? "dark" : "light")}
				/>
			</View>

			{/* Save button */}
			<TouchableOpacity
				onPress={handleSave}
				style={[styles.saveButton, { backgroundColor: Colors[theme].tint }]}
			>
				<Text style={[styles.saveText, { color: Colors[theme].text }]}>
					Save Preferences
				</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	header: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 20,
	},
	section: {
		marginBottom: 16,
	},
	sectionRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	label: {
		fontSize: 16,
		fontWeight: "500",
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 6,
		padding: 10,
		marginTop: 6,
		fontSize: 16,
	},
	saveButton: {
		padding: 16,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 30,
	},
	saveText: {
		fontWeight: "bold",
		fontSize: 16,
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});
