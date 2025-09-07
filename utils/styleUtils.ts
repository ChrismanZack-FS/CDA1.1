import { PixelRatio, Platform } from "react-native";
export const normalize = (size: number): number => {
	const scale = PixelRatio.get();
	const newSize = size * scale;

	if (Platform.OS === "ios") {
		return Math.round(PixelRatio.roundToNearestPixel(newSize));
	} else {
		return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
	}
};
export const getElevation = (elevation: number) => {
	if (Platform.OS === "android") {
		return { elevation };
	}

	return {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: elevation },
		shadowOpacity: 0.1,
		shadowRadius: elevation,
	};
};
