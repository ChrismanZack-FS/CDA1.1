import { router } from "expo-router";
import React, { useState } from "react";
import {
	Alert,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useTasksContext } from "../context/TasksContext";

export default function AddTaskScreen() {
	const { createTask } = useTasksContext();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

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

	return (
		<View style={styles.container}>
			<Text style={styles.label}>Title</Text>
			<TextInput
				style={styles.input}
				value={title}
				onChangeText={setTitle}
				placeholder="Task title"
			/>
			<Text style={styles.label}>Description</Text>
			<TextInput
				style={[styles.input, styles.textArea]}
				value={description}
				onChangeText={setDescription}
				multiline
				numberOfLines={4}
			/>
			<Text style={styles.label}>Priority</Text>
			<View style={styles.priorityContainer}>
				{["low", "medium", "high"].map((level) => (
					<TouchableOpacity
						key={level}
						style={[
							styles.priorityButton,
							priority === level && styles.activePriority,
						]}
						onPress={() => setPriority(level as "low" | "medium" | "high")}
					>
						<Text style={styles.priorityText}>{level}</Text>
					</TouchableOpacity>
				))}
			</View>
			<TouchableOpacity style={styles.saveButton} onPress={handleSave}>
				<Text style={styles.saveButtonText}>Save Task</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
	label: { fontWeight: "bold", marginTop: 16 },
	input: {
		backgroundColor: "white",
		padding: 12,
		borderRadius: 8,
		marginTop: 4,
		borderWidth: 1,
		borderColor: "#ddd",
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
		borderColor: "#000",
	},
	activePriority: { backgroundColor: "#007AFF" },
	priorityText: { fontWeight: "bold", color: "black" },
	saveButton: {
		backgroundColor: "#007AFF",
		padding: 16,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 24,
	},
	saveButtonText: { color: "white", fontWeight: "bold" },
});
