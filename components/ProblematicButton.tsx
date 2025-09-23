import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
// This component works great on mobile but has UX issues on web
export const ProblematicButton: React.FC<{
	onPress: () => void;
	children: React.ReactNode;
	variant?: "primary" | "secondary" | "small";
	disabled?: boolean;
}> = ({ onPress, children, variant = "primary", disabled = false }) => {
	return (
		<TouchableOpacity
			style={[styles.button, styles[variant], disabled && styles.disabled]}
			onPress={onPress}
			disabled={disabled}
			activeOpacity={0.7}
			// Issues:
			// - No web-specific hover states
			// - No keyboard accessibility
			// - Touch targets sized for mobile only
			// - No cursor pointer indication
		>
			<Text style={[styles.text, styles[`${variant}Text`]]}>{children}</Text>
		</TouchableOpacity>
	);
};
const styles = StyleSheet.create({
	button: {
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	primary: {
		backgroundColor: "#007AFF",
		paddingHorizontal: 16,
		paddingVertical: 12,
		minHeight: 44, // Good for mobile, might be small for web
	},
	secondary: {
		backgroundColor: "transparent",
		borderWidth: 1,
		borderColor: "#007AFF",
		paddingHorizontal: 16,
		paddingVertical: 12,
		minHeight: 44,
	},
	small: {
		backgroundColor: "#007AFF",
		paddingHorizontal: 12,
		paddingVertical: 8,
		minHeight: 32, // Too small for web interaction
	},
	disabled: {
		backgroundColor: "#cccccc",
		borderColor: "#cccccc",
	},
	text: {
		fontSize: 16,
		fontWeight: "600",
	},
	primaryText: {
		color: "white",
	},
	secondaryText: {
		color: "#007AFF",
	},
	smallText: {
		color: "white",
		fontSize: 14,
	},
});
