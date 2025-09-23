import React from "react";
import {
	Dimensions,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
const { width: screenWidth } = Dimensions.get("window");
export interface CardData {
	id: string;
	title: string;
	subtitle: string;
	description: string;
	action: string;
}
export const ProblematicCard: React.FC<{
	data: CardData;
	onActionPress: (id: string) => void;
}> = ({ data, onActionPress }) => {
	return (
		<View style={styles.card}>
			<View style={styles.content}>
				<Text style={styles.title} numberOfLines={1}>
					{data.title}
				</Text>
				<Text style={styles.subtitle} numberOfLines={1}>
					{data.subtitle}
				</Text>
				<Text style={styles.description} numberOfLines={3}>
					{data.description}
				</Text>
			</View>

			<TouchableOpacity
				style={styles.actionButton}
				onPress={() => onActionPress(data.id)}
				// Issues: Mobile touch target on web desktop
			>
				<Text style={styles.actionText}>{data.action}</Text>
			</TouchableOpacity>
		</View>
	);
};
const styles = StyleSheet.create({
	card: {
		backgroundColor: "white",
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		// Issue: Fixed width based on mobile screen size
		width: screenWidth - 32,
		alignSelf: "center",
		// Issue: Mobile-appropriate shadow, might need adjustment for web
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	content: {
		marginBottom: 16,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#1a1a1a",
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 14,
		color: "#666",
		marginBottom: 8,
	},
	description: {
		fontSize: 14,
		color: "#333",
		lineHeight: 20,
	},
	actionButton: {
		backgroundColor: "#007AFF",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 6,
		alignSelf: "flex-end",
		minHeight: 36, // Mobile-optimized touch target
	},
	actionText: {
		color: "white",
		fontSize: 14,
		fontWeight: "600",
	},
});
