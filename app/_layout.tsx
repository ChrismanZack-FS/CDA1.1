// app/_layout.tsx
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { TasksProvider } from "../context/TasksContext";
import databaseService from "../services/database";

export default function RootLayout() {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		(async () => {
			try {
				await databaseService.init();
				setReady(true);
			} catch (error) {
				console.error("DB init failed:", error);
			}
		})();
	}, []);

	if (!ready) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" />
				<Text style={{ marginTop: 10 }}>Initializing database...</Text>
			</View>
		);
	}

	return (
		<TasksProvider>
			<Stack>
				<Stack.Screen name="index" options={{ title: "Tasks" }} />
				<Stack.Screen name="add-task" options={{ title: "Add Task" }} />
				<Stack.Screen name="edit-task" options={{ title: "Edit Task" }} />
				<Stack.Screen name="settings" options={{ title: "Settings" }} />
			</Stack>
		</TasksProvider>
	);
}
