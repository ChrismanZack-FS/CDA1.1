import { Platform } from "react-native";
import { router } from "expo-router";
const handleNavigation = (route: string) => {
	if (Platform.OS === "web") {
		// Web: Update URL for better UX
		window.history.pushState(null, "", route);
	}
	router.push(route as any);
};
