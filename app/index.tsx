import { Link, useFocusEffect, useNavigation } from "expo-router";
import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useState,
} from "react";

import {
	Alert,
	FlatList,
	Platform,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { ThemedText } from "../components/ThemedText";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useTasks } from "../hooks/useTasks";
import databaseService, { Task } from "../services/database";
import { useUserPreferences } from "../hooks/useUserPreferences";
import { Colors } from "../constants/Colors";

export default function TasksScreen() {
	const { tasks, loading, error, deleteTask, updateTask, refreshTasks } =
		useTasks();
	const { preferences } = useUserPreferences();
	const [theme, setTheme] = useState<"light" | "dark">("light"); // default
	const breakpoint = useBreakpoint();
	const navigation = useNavigation();

	useEffect(() => {
		if (preferences.theme) setTheme(preferences.theme);
	}, [preferences]);

	// Refresh tasks when returning to this screen
	useFocusEffect(
		useCallback(() => {
			refreshTasks();
		}, [])
	);

	// Initialize database on mount
	useEffect(() => {
		databaseService.init().catch(console.error);
	}, []);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerStyle: {
				backgroundColor: Colors[theme].background, // header background
			},
			headerTintColor: Colors[theme].text, // back button & title color
			headerRight: () => (
				<Link href="/settings" asChild>
					<TouchableOpacity style={{ marginRight: 15 }}>
						<Text style={{ fontSize: 22, color: Colors[theme].text }}>⚙️</Text>
					</TouchableOpacity>
				</Link>
			),
		});
	}, [navigation, theme]);

	const handleToggleComplete = async (id: number, completed: boolean) => {
		try {
			await updateTask(id, { completed: !completed });
		} catch (error) {
			Alert.alert("Error", "Failed to update task");
		}
	};

	const handleDeleteTask = async (id: number) => {
		if (Platform.OS === "web") {
			if (!window.confirm("Are you sure you want to delete this task?")) return;
			await deleteTask(id);
			return;
		}

		Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: async () => {
					try {
						await deleteTask(id);
					} catch {
						Alert.alert("Error", "Failed to delete task");
					}
				},
			},
		]);
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "high":
				return "#DC2626"; // red-600
			case "medium":
				return "#D97706"; // yellow-600
			case "low":
				return "#16A34A"; // green-600
			default:
				return "#4B5563"; // gray-600
		}
	};

	const getNumColumns = () => {
		switch (breakpoint) {
			case "xl":
				return 3;
			case "lg":
				return 2;
			default:
				return 1;
		}
	};

	const renderTask = ({ item }: { item: Task }) => (
		<View
			style={[
				styles.taskItem,
				{
					backgroundColor:
						theme === "dark" ? "#1F2937" : Colors[theme].background,
				},
			]}
		>
			<TouchableOpacity
				onPress={() => handleToggleComplete(item.id, item.completed)}
				style={{ flex: 1 }}
			>
				<ThemedText
					type="defaultSemiBold"
					style={{
						flex: 1,
						textDecorationLine: item.completed ? "line-through" : "none",
						color: item.completed ? Colors[theme].icon : Colors[theme].text,
					}}
				>
					{item.title}
				</ThemedText>
				<ThemedText
					type="default"
					style={{ color: Colors[theme].icon, marginBottom: 8 }}
				>
					{item.description}
				</ThemedText>
				<ThemedText
					type="default"
					style={{
						fontSize: 14,
						fontWeight: "500",
						textTransform: "uppercase",
						color: getPriorityColor(item.priority),
					}}
				>
					{item.priority}
				</ThemedText>
			</TouchableOpacity>

			<View style={styles.taskActions}>
				{/* Edit button */}
				<Link
					href={{
						pathname: "/edit-task",
						params: { id: item.id },
					}}
					asChild
				>
					<TouchableOpacity style={{ padding: 4 }}>
						<Text style={{ flex: 1 }}>✏️</Text>
					</TouchableOpacity>
				</Link>

				<View style={styles.taskActions}>
					<TouchableOpacity
						onPress={() => handleDeleteTask(item.id)}
						activeOpacity={0.6}
						style={{ padding: 4 }}
					>
						<Text style={styles.deleteButton}>🗑️</Text>
					</TouchableOpacity>
					<Text style={styles.taskStatus}>{item.completed ? "✅" : "⭕"}</Text>
				</View>
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
		<View
			style={[styles.container, { backgroundColor: Colors[theme].background }]}
		>
			<FlatList
				data={tasks}
				renderItem={renderTask}
				keyExtractor={(item) => item.id?.toString() || ""}
				numColumns={getNumColumns()}
				key={getNumColumns()}
				contentContainerStyle={{ padding: 16 }}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<Text
							style={{
								fontSize: 18,
								fontWeight: "bold",
								color: Colors[theme].text,
								marginBottom: 8,
							}}
						>
							No tasks yet!
						</Text>
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
	container: { flex: 1 },
	centered: { justifyContent: "center", alignItems: "center" },
	taskItem: {
		padding: 16,
		marginBottom: 8,
		borderRadius: 8,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	taskActions: { flexDirection: "row", alignItems: "center" },
	deleteButton: { fontSize: 20, marginRight: 10 },
	taskStatus: { fontSize: 24 },
	addButton: {
		backgroundColor: "#007AFF",
		margin: 16,
		padding: 16,
		borderRadius: 8,
		alignItems: "center",
	},
	addButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
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
	emptySubtext: { fontSize: 14, color: "#999" },
	errorText: { color: "red", fontSize: 16 },
});
