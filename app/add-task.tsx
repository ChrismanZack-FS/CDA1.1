import { router } from "expo-router";
import React, { useState, useEffect, useLayoutEffect } from "react";
import {
	Alert,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useTasksContext } from "../context/TasksContext";
import { useUserPreferences } from "../hooks/useUserPreferences";
import { Colors } from "../constants/Colors";
import { useNavigation } from "@react-navigation/native";

export default function AddTaskScreen() {
	const { createTask } = useTasksContext();
	const navigation = useNavigation();
	const { preferences } = useUserPreferences();
	const [theme, setTheme] = useState<"light" | "dark">("light");

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

	// Update theme when preferences change
	useEffect(() => {
		if (preferences.theme) setTheme(preferences.theme);
	}, [preferences]);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerStyle: { backgroundColor: Colors[theme].background },
			headerTintColor: Colors[theme].text,
			headerTitleStyle: { color: Colors[theme].text },
		});
	}, [navigation, theme]);

	const handleSave = async () => {
		if (!title.trim()) {
			Alert.alert("Error", "Title is required");
			return;
		}

		try {
			const now = new Date().toISOString();
			await createTask({
				title,
				description,
				completed: false,
				priority,
				createdAt: now,
				updatedAt: now,
			});

			router.push("/"); // go back to task list
		} catch (err) {
			console.error("Failed to save task:", err);
			Alert.alert("Error", "Failed to save task");
		}
	};

	const getPriorityColor = (level: string) => {
		switch (level) {
			case "high":
				return "#DC2626";
			case "medium":
				return "#D97706";
			case "low":
				return "#16A34A";
			default:
				return Colors[theme].icon;
		}
	};

	return (
		<View
			style={[styles.container, { backgroundColor: Colors[theme].background }]}
		>
			<Text style={[styles.label, { color: Colors[theme].text }]}>Title</Text>
			<TextInput
				style={[
					styles.input,
					{
						backgroundColor: Colors[theme].tint,
						color: Colors[theme].text,
						borderColor: Colors[theme].icon,
					},
				]}
				value={title}
				onChangeText={setTitle}
				placeholder="Task title"
				placeholderTextColor={Colors[theme].icon}
			/>

			<Text style={[styles.label, { color: Colors[theme].text }]}>
				Description
			</Text>
			<TextInput
				style={[
					styles.input,
					styles.textArea,
					{
						backgroundColor: Colors[theme].tint,
						color: Colors[theme].text,
						borderColor: Colors[theme].icon,
					},
				]}
				value={description}
				onChangeText={setDescription}
				multiline
				numberOfLines={4}
				placeholder="Task description"
				placeholderTextColor={Colors[theme].icon}
			/>

			<Text style={[styles.label, { color: Colors[theme].text }]}>
				Priority
			</Text>
			<View style={styles.priorityContainer}>
				{["low", "medium", "high"].map((level) => (
					<TouchableOpacity
						key={level}
						style={[
							styles.priorityButton,
							{
								borderColor: Colors[theme].icon,
								backgroundColor:
									priority === level
										? getPriorityColor(level)
										: Colors[theme].tint,
							},
						]}
						onPress={() => setPriority(level as "low" | "medium" | "high")}
					>
						<Text
							style={[
								styles.priorityText,
								{
									color:
										priority === level
											? Colors[theme].background
											: Colors[theme].text,
								},
							]}
						>
							{level}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			<TouchableOpacity
				style={[styles.saveButton, { backgroundColor: Colors[theme].tint }]}
				onPress={handleSave}
			>
				<Text style={[styles.saveButtonText, { color: Colors[theme].text }]}>
					Save Task
				</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	label: { fontWeight: "bold", marginTop: 16 },
	input: {
		padding: 12,
		borderRadius: 8,
		marginTop: 4,
		borderWidth: 1,
	},
	textArea: { height: 100, textAlignVertical: "top" },
	priorityContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginTop: 10,
	},
	priorityButton: {
		padding: 10,
		borderRadius: 8,
		borderWidth: 1,
	},
	priorityText: { fontWeight: "bold" },
	saveButton: {
		padding: 16,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 24,
	},
	saveButtonText: { fontWeight: "bold" },
});
