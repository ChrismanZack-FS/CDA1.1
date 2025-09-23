import React from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
interface NavItem {
	id: string;
	label: string;
	icon: string;
}
export const ProblematicNavigation: React.FC<{
	items: NavItem[];
	activeId: string;
	onItemPress: (id: string) => void;
}> = ({ items, activeId, onItemPress }) => {
	return (
		<View style={styles.container}>
			{/* Issues: Mobile-style bottom tab bar on web desktop */}
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				style={styles.scrollContainer}
				contentContainerStyle={styles.scrollContent}
			>
				{items.map((item) => (
					<TouchableOpacity
						key={item.id}
						style={[
							styles.navItem,
							activeId === item.id && styles.activeNavItem,
						]}
						onPress={() => onItemPress(item.id)}
						// Issues:
						// - No keyboard navigation
						// - No hover states for web
						// - Touch-optimized sizing on desktop
					>
						<Text style={styles.icon}>{item.icon}</Text>
						<Text
							style={[styles.label, activeId === item.id && styles.activeLabel]}
						>
							{item.label}
						</Text>
					</TouchableOpacity>
				))}
			</ScrollView>
		</View>
	);
};
const styles = StyleSheet.create({
	container: {
		backgroundColor: "#f8f9fa",
		borderTopWidth: 1,
		borderTopColor: "#e9ecef",
		// Issue: Fixed height good for mobile, awkward on web
		height: 80,
	},
	scrollContainer: {
		flex: 1,
	},
	scrollContent: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
	},
	navItem: {
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 20,
		paddingVertical: 8,
		marginHorizontal: 4,
		borderRadius: 8,
		minWidth: 80, // Good for mobile, might be cramped on web
	},
	activeNavItem: {
		backgroundColor: "#007AFF",
	},
	icon: {
		fontSize: 20,
		marginBottom: 4,
	},
	label: {
		fontSize: 12, // Small text good for mobile, hard to read on web
		fontWeight: "500",
		color: "#666",
		textAlign: "center",
	},
	activeLabel: {
		color: "white",
	},
});
