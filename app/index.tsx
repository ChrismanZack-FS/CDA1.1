import { Link, useFocusEffect, useNavigation } from "expo-router";
import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useState,
} from "react";
import { designTokens } from "../theme/designTokens";

import {
	Alert,
	FlatList,
	Platform,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { ConnectionStatus } from "../components/ConnectionStatus";

import { Colors } from "../constants/Colors";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useSocket } from "../hooks/useSocket";
import { useTasks } from "../hooks/useTasks";
import { useUserPreferences } from "../hooks/useUserPreferences";
import databaseService, { Task } from "../services/database";

export default function TasksScreen() {
	const {
		tasks,
		loading,
		error,
		deleteTask,
		updateTask,
		refreshTasks,
		createTask,
	} = useTasks();

	const { preferences } = useUserPreferences();
	const [theme, setTheme] = useState<"light" | "dark">("light"); // default
	const breakpoint = useBreakpoint();
	const navigation = useNavigation();
	const { isConnected, emit } = useSocket();

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
				backgroundColor:
					theme === "dark"
						? designTokens.colors.neutral[900]
						: designTokens.colors.neutral[50],
			},
			headerTintColor:
				theme === "dark"
					? designTokens.colors.neutral[50]
					: designTokens.colors.neutral[900],
			headerRight:
				breakpoint === "sm" || breakpoint === "md"
					? undefined
					: () => (
							<View style={{ flexDirection: "row", alignItems: "center" }}>
								{/* Chat Link */}
								<TouchableOpacity
									style={{ marginRight: 15 }}
									onPress={() => navigation.navigate("Chat")}
								>
									<Text
										style={{
											fontSize: 22,
											color:
												theme === "dark"
													? designTokens.colors.neutral[50]
													: designTokens.colors.neutral[900],
										}}
									>
										💬
									</Text>
								</TouchableOpacity>

								{/* Collaborative Link */}
								<TouchableOpacity
									style={{ marginRight: 15 }}
									onPress={() => navigation.navigate("Collaborative")}
								>
									<Text
										style={{
											fontSize: 22,
											color:
												theme === "dark"
													? designTokens.colors.neutral[50]
													: designTokens.colors.neutral[900],
										}}
									>
										🤝
									</Text>
								</TouchableOpacity>

								{/* Settings Link */}
								<TouchableOpacity
									style={{ marginRight: 15 }}
									onPress={() => navigation.navigate("Settings")}
								>
									<Text
										style={{
											fontSize: 22,
											color:
												theme === "dark"
													? designTokens.colors.neutral[50]
													: designTokens.colors.neutral[900],
										}}
									>
										⚙️
									</Text>
								</TouchableOpacity>
							</View>
						),
		});
	}, [navigation, theme, breakpoint]);

	const handleToggleComplete = async (id: number, completed: boolean) => {
		try {
			const task = tasks.find((t) => t.id === id);
			if (!task) return;
			await databaseService.updateTask(id, { completed: !task.completed });
			const updatedTask = await updateTask(id, { completed: !task.completed });
			if (isConnected) {
				emit("task_updated", {
					taskId: id,
					completed: updatedTask?.completed,
					timestamp: new Date().toISOString(),
				});
			}
		} catch (error) {
			console.error("Error updating task:", error);
			Alert.alert("Error", "Failed to update task. Please try again.");
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
						if (isConnected) {
							emit("task_deleted", {
								taskId: id,
								timestamp: new Date().toISOString(),
							});
						}
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
				return 2;
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
						theme === "dark"
							? designTokens.colors.neutral[900]
							: designTokens.colors.neutral[50],
				},
			]}
		>
			<TouchableOpacity
				onPress={() => handleToggleComplete(item.id, item.completed)}
				style={{ flex: 1 }}
			>
				<Text
					style={{
						flex: 1,
						textDecorationLine: item.completed ? "line-through" : "none",
						color: item.completed
							? designTokens.colors.neutral[500]
							: theme === "dark"
								? designTokens.colors.neutral[50]
								: designTokens.colors.neutral[900],
						fontWeight: "600",
						fontSize: designTokens.typography.fontSize.lg,
						marginBottom: 2,
					}}
				>
					{item.title}
				</Text>
				<Text
					style={{
						color:
							theme === "dark"
								? designTokens.colors.neutral[100]
								: designTokens.colors.neutral[500],
						marginBottom: 8,
						fontSize: designTokens.typography.fontSize.base,
					}}
				>
					{item.description}
				</Text>
				<Text
					style={{
						color:
							theme === "dark"
								? designTokens.colors.neutral[100]
								: designTokens.colors.neutral[500],
						marginBottom: 8,
						fontSize: designTokens.typography.fontSize.sm,
					}}
				>
					{new Date(item.createdAt).toLocaleDateString()}
				</Text>
				<Text
					style={{
						fontSize: 14,
						fontWeight: "500",
						textTransform: "uppercase",
						color: getPriorityColor(item.priority),
					}}
				>
					{item.priority}
				</Text>
			</TouchableOpacity>

			<View style={styles.taskActions}>
				{/* Edit button */}
				<TouchableOpacity
					style={{ padding: 4 }}
					onPress={() => navigation.navigate("EditTask", { id: item.id })}
				>
					<Text>✏️</Text>
				</TouchableOpacity>
				{/* Delete button */}
				<TouchableOpacity
					onPress={() => handleDeleteTask(item.id)}
					activeOpacity={0.6}
					style={{ padding: 4 }}
				>
					<Text style={styles.deleteButton}>🗑️</Text>
				</TouchableOpacity>
				{/* Status icon */}
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
		<View
			style={[styles.container, { backgroundColor: Colors[theme].background }]}
		>
			{/* Connection Status */}

			<ConnectionStatus />

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

			{isConnected && (
				<Text className="text-green-600 dark:text-green-400">
					{" "}
					• Live sync enabled
				</Text>
			)}

			<TouchableOpacity
				style={styles.addButton}
				onPress={() => navigation.navigate("AddTask")}
			>
				<Text style={styles.addButtonText}>+ Add Task</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	centered: { justifyContent: "center", alignItems: "center" },
	taskItem: {
		padding: 16,
		margin: 8,
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
	connectionStatusText: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 8,
	},
});
