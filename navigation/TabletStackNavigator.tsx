import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MobileTabNavigator } from "./MobileTabNavigator";
import AddTaskScreen from "../app/add-task";

const Stack = createNativeStackNavigator();

export const TabletStackNavigator: React.FC = () => (
	<Stack.Navigator>
		<Stack.Screen
			name="Main"
			component={MobileTabNavigator}
			options={{ headerShown: false }}
		/>
		<Stack.Screen
			name="AddTask"
			component={AddTaskScreen}
			options={{ presentation: "modal", title: "Add Task" }}
		/>
	</Stack.Navigator>
);
