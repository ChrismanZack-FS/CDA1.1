import React, { useState } from "react";
import {
	Dimensions,
	Platform,
	SafeAreaView,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { ProblematicButton } from "../components/ProblematicButton";
import { CardData, ProblematicCard } from "../components/ProblematicCard";
import { ProblematicNavigation } from "../components/ProblematicNavigation";
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const navItems = [
	{ id: "home", label: "Home", icon: "🏠" },
	{ id: "explore", label: "Explore", icon: "🔍" },
	{ id: "favorites", label: "Favorites", icon: "❤️" },
	{ id: "profile", label: "Profile", icon: "👤" },
	{ id: "settings", label: "Settings", icon: "⚙️" },
];
const cardData: CardData[] = [
	{
		id: "1",
		title: "Mobile-First Design",
		subtitle: "Best Practices",
		description:
			"This card was designed for mobile screens and might not adapt well to larger desktop displays.",
		action: "Learn More",
	},
	{
		id: "2",
		title: "Cross-Platform Challenge",
		subtitle: "UX Considerations",
		description:
			"What works perfectly on mobile might feel cramped or awkward on web browsers.",
		action: "Explore",
	},
	{
		id: "3",
		title: "Touch vs Mouse",
		subtitle: "Interaction Patterns",
		description:
			"Touch-optimized interfaces need different considerations when used with mouse and keyboard.",
		action: "View Details",
	},
];
export default function ProblematicApp() {
	const [activeTab, setActiveTab] = useState("home");
	const [actionCount, setActionCount] = useState(0);
	const handleCardAction = (id: string) => {
		setActionCount((prev) => prev + 1);
		console.log(`Card action: ${id}, Total actions: ${actionCount + 1}`);
	};
	const handleQuickAction = (action: string) => {
		setActionCount((prev) => prev + 1);
		console.log(`Quick action: ${action}`);
	};
	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" backgroundColor="#fff" />

			{/* Issues: Mobile-style header on web */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>My App</Text>
				<Text style={styles.headerSubtitle}>Current Tab: {activeTab}</Text>
				<Text style={styles.actionCounter}>Actions: {actionCount}</Text>
			</View>
			<ScrollView
				style={styles.content}
				contentContainerStyle={styles.contentContainer}
				// Issue: Mobile scroll behavior on desktop web
				showsVerticalScrollIndicator={Platform.OS !== "web"}
			>
				<Text style={styles.sectionTitle}>Quick Actions</Text>

				{/* Issue: Mobile-style button layout on desktop */}
				<View style={styles.buttonGroup}>
					<ProblematicButton onPress={() => handleQuickAction("primary")}>
						Primary Action
					</ProblematicButton>
					<ProblematicButton
						variant="secondary"
						onPress={() => handleQuickAction("secondary")}
					>
						Secondary Action
					</ProblematicButton>
					<ProblematicButton
						variant="small"
						onPress={() => handleQuickAction("small")}
					>
						Small Button
					</ProblematicButton>
				</View>
				<Text style={styles.sectionTitle}>Content Cards</Text>

				{/* Issue: Mobile card layout on wide screens */}
				{cardData.map((card) => (
					<ProblematicCard
						key={card.id}
						data={card}
						onActionPress={handleCardAction}
					/>
				))}
				{/* Issue: Mobile-specific spacing on web */}
				<View style={styles.spacer} />
			</ScrollView>
			{/* Issue: Mobile bottom navigation on desktop web */}
			<ProblematicNavigation
				items={navItems}
				activeId={activeTab}
				onItemPress={setActiveTab}
			/>
		</SafeAreaView>
	);
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	header: {
		backgroundColor: "#f8f9fa",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#e9ecef",
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#1a1a1a",
	},
	headerSubtitle: {
		fontSize: 14,
		color: "#666",
		marginTop: 2,
	},
	actionCounter: {
		fontSize: 12,
		color: "#007AFF",
		marginTop: 2,
	},
	content: {
		flex: 1,
	},
	contentContainer: {
		padding: 16,
		paddingBottom: 100, // Issue: Fixed padding for mobile bottom nav
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: "#1a1a1a",
		marginBottom: 16,
		marginTop: 8,
	},
	buttonGroup: {
		gap: 12,
		marginBottom: 32,
	},
	spacer: {
		height: 40, // Issue: Mobile-specific spacing
	},
});
