import { Platform, StyleSheet } from "react-native";
export const createPlatformStyles = () =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: "#f5f5f5",
			...(Platform.OS === "web" && {
				maxWidth: 800,
				alignSelf: "center",
				width: "100%",
				paddingTop: 32,
			}),
		},
		taskItem: {
			backgroundColor: "white",
			padding: Platform.OS === "web" ? 20 : 16,
			marginBottom: 16,
			borderRadius: 12,
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			...(Platform.OS === "web" && {
				cursor: "pointer",
				transition: "box-shadow 0.2s",
				boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
			}),
		},
		taskItemHover: {
			...(Platform.OS === "web" && {
				boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
				backgroundColor: "#f0f6ff",
			}),
		},
		taskActions: {
			flexDirection: "row",
			alignItems: "center",
		},
		deleteButton: {
			fontSize: 20,
			marginRight: 10,
		},
		taskStatus: {
			fontSize: 24,
		},
		addButton: {
			backgroundColor: "#007AFF",
			margin: 24,
			padding: Platform.OS === "web" ? 16 : 16,
			borderRadius: 8,
			alignItems: "center",
			...(Platform.OS === "web" && {
				maxWidth: 400,
				alignSelf: "center",
			}),
		},
		addButtonText: {
			color: "white",
			fontSize: 16,
			fontWeight: "bold",
		},
		// Additional styles for completeness
		emptyState: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			paddingTop: 100,
		},
		emptySubtext: {
			fontSize: 14,
			color: "#999",
		},
		errorText: {
			color: "red",
			fontSize: 16,
		},
		connectionStatusText: {
			fontSize: 18,
			fontWeight: "bold",
			marginBottom: 8,
		},
		centered: {
			justifyContent: "center",
			alignItems: "center",
		},
	});
