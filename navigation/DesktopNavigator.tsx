import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TasksScreen from "../app/index";
import Settings from "../app/settings";
import AddTaskScreen from "../app/add-task";
import ChatScreen from "../app/chat";
import CollaborativeScreen from "../app/collaborative";
import EditTaskScreen from "../app/edit-task";

const Stack = createNativeStackNavigator();

export const DesktopNavigator: React.FC = () => (
	<Stack.Navigator>
		<Stack.Screen name="Tasks" component={TasksScreen} />
		<Stack.Screen name="AddTask" component={AddTaskScreen} />
		<Stack.Screen name="Settings" component={Settings} />
		<Stack.Screen name="Chat" component={ChatScreen} />
		<Stack.Screen name="Collaborative" component={CollaborativeScreen} />
		<Stack.Screen name="EditTask" component={EditTaskScreen} />
	</Stack.Navigator>
);
