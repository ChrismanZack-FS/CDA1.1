if (typeof window !== "undefined" && __DEV__) {
	window.localStorage = window.localStorage || {};
	window.localStorage.debug = "socket.io-client:socket";
}
// app/_layout.tsx
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { TasksProvider } from "../context/TasksContext";
import databaseService from "../services/database";
import { socketService } from "../services/socketService";

export default function RootLayout() {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		socketService.connect(); // Ensure socket is connected before chat logic
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
				<Stack.Screen name="chat" options={{ title: "Chat" }} />
				<Stack.Screen
					name="collaborative"
					options={{ title: "Collaborative" }}
				/>
			</Stack>
		</TasksProvider>
	);
}
