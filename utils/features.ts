import config from "@/constants/config";
import { router } from "expo-router";
import { Platform } from "react-native";

// Web-only features
if (Platform.OS === "web") {
	// Add keyboard shortcuts
	document.addEventListener("keydown", (e) => {
		if (e.ctrlKey && e.key === "n") {
			e.preventDefault();
			router.push("/add-task");
		}
	});

	// Add web analytics
	if (config.webAnalyticsId) {
		// Initialize analytics
	}
}
