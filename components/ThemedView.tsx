import React from "react";
import { View } from "react-native";

import { useColorScheme } from "../hooks/useColorScheme";

interface ThemedViewProps {
	children: React.ReactNode;
	className?: string;
}
export default function ThemedView({
	children,
	className = "",
}: ThemedViewProps) {
	const colorScheme = useColorScheme();

	const themeClasses = colorScheme === "dark" ? "bg-gray-900" : "bg-gray-50";
	return <View className={`${themeClasses} ${className}`}>{children}</View>;
}
