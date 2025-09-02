import React, { useEffect } from "react";
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	StyleSheet,
	Alert,
} from "react-native";
import { Link } from "expo-router";
import { useTasks } from "../hooks/useTasks";
import databaseService from "../services/database";
export default function TasksScreen() {
	const { tasks, loading, error, deleteTask, updateTask } = useTasks();
	useEffect(() => {
		// Initialize database when component mounts
		databaseService.init().catch(console.error);
	}, []);
	const handleToggleComplete = async (id: number, completed: boolean) => {
		try {
			await updateTask(id, { completed: !completed });
		} catch (error) {
			Alert.alert("Error", "Failed to update task");
		}
	};
	const handleDeleteTask = async (id: number) => {
		Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: async () => {
					try {
						await deleteTask(id);
					} catch (error) {
						Alert.alert("Error", "Failed to delete task");
					}
				},
			},
		]);
	};
	const renderTask = ({ item }) => (
		<View style={styles.taskItem}>
			<TouchableOpacity
				style={styles.taskContent}
				onPress={() => handleToggleComplete(item.id, item.completed)}
			>
				<Text
					style={[styles.taskTitle, item.completed && styles.completedTask]}
				>
					{item.title}
				</Text>
				<Text style={styles.taskDescription}>{item.description}</Text>
				<Text style={styles.taskPriority}>Priority: {item.priority}</Text>
			</TouchableOpacity>

			<View style={styles.taskActions}>
				<TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
					<Text style={styles.deleteButton}>🗑️</Text>
				</TouchableOpacity>
				<Text style={styles.taskStatus}>{item.completed ? "✅" : "⭕"}</Text>
			</View>
		</View>
	);
	if (loading) {
		return (
			<View style={[styles.container, styles.centered]}>
				<Text>Loading tasks...</Text>
			</View>
		);
	}
	if (error) {
		return (
			<View style={[styles.container, styles.centered]}>
				<Text style={styles.errorText}>Error: {error}</Text>
			</View>
		);
	}
	return (
		<View style={styles.container}>
			<FlatList
				data={tasks}
				renderItem={renderTask}
				keyExtractor={(item) => item.id?.toString() || ""}
				style={styles.list}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<Text style={styles.emptyText}>No tasks yet!</Text>
						<Text style={styles.emptySubtext}>
							Create your first task to get started.
						</Text>
					</View>
				}
			/>

			<Link href="/add-task" asChild>
				<TouchableOpacity style={styles.addButton}>
					<Text style={styles.addButtonText}>+ Add Task</Text>
				</TouchableOpacity>
			</Link>
		</View>
	);
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	centered: {
		justifyContent: "center",
		alignItems: "center",
	},
	list: {
		flex: 1,
		padding: 16,
	},
	taskItem: {
		backgroundColor: "white",
		padding: 16,
		marginBottom: 8,
		borderRadius: 8,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	taskContent: {
		flex: 1,
	},
	taskTitle: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 4,
	},
	completedTask: {
		textDecorationLine: "line-through",
		color: "#999",
	},
	taskDescription: {
		fontSize: 14,
		color: "#666",
		marginBottom: 4,
	},
	taskPriority: {
		fontSize: 12,
		color: "#888",
		textTransform: "capitalize",
	},
	taskActions: {
		flexDirection: "row",
		alignItems: "center",
	},
	deleteButton: {
		fontSize: 20,
		marginRight: 10,
	},
	taskStatus: {
		fontSize: 24,
	},
	addButton: {
		backgroundColor: "#007AFF",
		margin: 16,
		padding: 16,
		borderRadius: 8,
		alignItems: "center",
	},
	addButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
	emptyState: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingTop: 100,
	},
	emptyText: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#666",
		marginBottom: 8,
	},
	emptySubtext: {
		fontSize: 14,
		color: "#999",
	},
	errorText: {
		color: "red",
		fontSize: 16,
	},
});
