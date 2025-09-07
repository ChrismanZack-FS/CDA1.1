import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useLayoutEffect } from "react";
import {
	Alert,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useTasks } from "../hooks/useTasks";
import { useUserPreferences } from "../hooks/useUserPreferences";
import { Colors } from "../constants/Colors";
import { useNavigation } from "@react-navigation/native";

export default function EditTask() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const navigation = useNavigation();
	const { tasks, updateTask } = useTasks();
	const { preferences } = useUserPreferences();
	const [theme, setTheme] = useState<"light" | "dark">("light");

	const task = tasks.find((t) => t.id === Number(id));
	const [title, setTitle] = useState(task?.title || "");
	const [description, setDescription] = useState(task?.description || "");

	useLayoutEffect(() => {
		navigation.setOptions({
			headerStyle: { backgroundColor: Colors[theme].background },
			headerTintColor: Colors[theme].text,
			headerTitleStyle: { color: Colors[theme].text },
		});
	}, [navigation, theme]);
	useEffect(() => {
		if (preferences.theme) setTheme(preferences.theme);
	}, [preferences]);

	useEffect(() => {
		if (task) {
			setTitle(task.title);
			setDescription(task.description);
		}
	}, [task]);

	const handleSave = async () => {
		try {
			await updateTask(Number(id), { title, description });
			router.back(); // ✅ navigate back to index.tsx
		} catch {
			Alert.alert("Error", "Failed to update task");
		}
	};

	if (!task) {
		return (
			<View
				style={[
					styles.container,
					{ backgroundColor: Colors[theme].background },
				]}
			>
				<Text style={{ color: Colors[theme].text }}>Task not found</Text>
			</View>
		);
	}

	return (
		<View
			style={[styles.container, { backgroundColor: Colors[theme].background }]}
		>
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
				placeholder="Title"
				placeholderTextColor={Colors[theme].icon}
			/>
			<TextInput
				style={[
					styles.input,
					{
						height: 100,
						backgroundColor: Colors[theme].tint,
						color: Colors[theme].text,
						borderColor: Colors[theme].icon,
					},
				]}
				value={description}
				onChangeText={setDescription}
				placeholder="Description"
				placeholderTextColor={Colors[theme].icon}
				multiline
			/>
			<TouchableOpacity
				style={[styles.saveButton, { backgroundColor: Colors[theme].tint }]}
				onPress={handleSave}
			>
				<Text style={[styles.saveText, { color: Colors[theme].text }]}>
					Save
				</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	input: {
		borderWidth: 1,
		padding: 12,
		borderRadius: 8,
		marginBottom: 12,
	},
	saveButton: {
		padding: 16,
		borderRadius: 8,
		alignItems: "center",
	},
	saveText: { fontWeight: "bold" },
});
