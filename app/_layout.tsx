import { Stack } from "expo-router";
export default function RootLayout() {
	return (
		<Stack>
			<Stack.Screen name="index" options={{ title: "Tasks" }} />
			<Stack.Screen name="add-task" options={{ title: "Add Task" }} />
			<Stack.Screen name="edit-task" options={{ title: "Edit Task" }} />
		</Stack>
	);
}
