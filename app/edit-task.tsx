import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	Alert,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useTasks } from "../hooks/useTasks";

export default function EditTask() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const { tasks, updateTask } = useTasks();

	const task = tasks.find((t) => t.id === Number(id));
	const [title, setTitle] = useState(task?.title || "");
	const [description, setDescription] = useState(task?.description || "");

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
			<View style={styles.container}>
				<Text>Task not found</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.input}
				value={title}
				onChangeText={setTitle}
				placeholder="Title"
			/>
			<TextInput
				style={[styles.input, { height: 100 }]}
				value={description}
				onChangeText={setDescription}
				placeholder="Description"
				multiline
			/>
			<TouchableOpacity style={styles.saveButton} onPress={handleSave}>
				<Text style={styles.saveText}>Save</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16, backgroundColor: "#fff" },
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 12,
		borderRadius: 8,
		marginBottom: 12,
	},
	saveButton: {
		backgroundColor: "#007AFF",
		padding: 16,
		borderRadius: 8,
		alignItems: "center",
	},
	saveText: { color: "white", fontWeight: "bold" },
});
