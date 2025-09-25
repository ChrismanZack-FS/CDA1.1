import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import TasksScreen from "../app/index";
import ChatScreen from "../app/chat";
import CollaborativeScreen from "../app/collaborative";
import SettingsScreen from "../app/settings";
import { Text } from "react-native";
import { useUserPreferences } from "../hooks/useUserPreferences";
import { designTokens } from "../theme/designTokens";

const Tab = createBottomTabNavigator();

export const MobileTabNavigator: React.FC = () => {
	const { preferences } = useUserPreferences();
	const theme = preferences.theme === "dark" ? "dark" : "light";
	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ color, size }) => {
					let icon = "📋";
					if (route.name === "Chat") icon = "💬";
					if (route.name === "Collaborative") icon = "🤝";
					if (route.name === "Settings") icon = "⚙️";
					return (
						<Text
							style={{
								fontSize: designTokens.typography.fontSize.lg,
								fontFamily: designTokens.typography.fontFamily.sans,
								color,
							}}
						>
							{icon}
						</Text>
					);
				},
				tabBarActiveTintColor:
					theme === "dark"
						? designTokens.colors.primary[500]
						: designTokens.colors.primary[900],
				tabBarInactiveTintColor:
					theme === "dark"
						? designTokens.colors.neutral[100]
						: designTokens.colors.neutral[500],
				tabBarStyle: {
					backgroundColor:
						theme === "dark"
							? designTokens.colors.neutral[900]
							: designTokens.colors.neutral[50],
					borderTopColor:
						theme === "dark"
							? designTokens.colors.neutral[700]
							: designTokens.colors.neutral[200],
				},
			})}
		>
			<Tab.Screen name="Tasks" component={TasksScreen} />
			<Tab.Screen name="Chat" component={ChatScreen} />
			<Tab.Screen name="Collaborative" component={CollaborativeScreen} />
			<Tab.Screen name="Settings" component={SettingsScreen} />
		</Tab.Navigator>
	);
};
