import { useEffect, useState } from "react";
import { Dimensions, Platform } from "react-native";
interface Breakpoint {
	name: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
	width: number;
	height: number;
}
export const useResponsive = () => {
	const [dimensions, setDimensions] = useState(() => {
		const { width, height } = Dimensions.get("window");
		return { width, height };
	});
	useEffect(() => {
		const subscription = Dimensions.addEventListener("change", ({ window }) => {
			setDimensions({ width: window.width, height: window.height });
		});
		return () => subscription?.remove();
	}, []);
	// Determine current breakpoint
	const getCurrentBreakpoint = (): Breakpoint => {
		const { width, height } = dimensions;

		if (width >= 1536) return { name: "2xl", width, height };
		if (width >= 1280) return { name: "xl", width, height };
		if (width >= 1024) return { name: "lg", width, height };
		if (width >= 768) return { name: "md", width, height };
		if (width >= 640) return { name: "sm", width, height };
		return { name: "xs", width, height };
	};
	const breakpoint = getCurrentBreakpoint();
	// Platform and form factor detection
	const isPhone = breakpoint.width < 768;
	const isTablet = breakpoint.width >= 768 && breakpoint.width < 1024;
	const isDesktop = breakpoint.width >= 1024;
	const isMobile = Platform.OS === "ios" || Platform.OS === "android";
	const isWeb = Platform.OS === "web";
	// Responsive value utilities
	const responsive = <T>(values: {
		xs?: T;
		sm?: T;
		md?: T;
		lg?: T;
		xl?: T;
		"2xl"?: T;
	}): T | undefined => {
		const { name } = breakpoint;

		// Find the appropriate value for current breakpoint
		if (values[name] !== undefined) return values[name];

		// Fallback to smaller breakpoints
		const fallbackOrder: Array<keyof typeof values> = [
			"xl",
			"lg",
			"md",
			"sm",
			"xs",
		];
		const currentIndex = fallbackOrder.indexOf(name);

		for (let i = currentIndex + 1; i < fallbackOrder.length; i++) {
			const fallbackKey = fallbackOrder[i];
			if (values[fallbackKey] !== undefined) {
				return values[fallbackKey];
			}
		}

		return undefined;
	};
	return {
		dimensions,
		breakpoint,
		isPhone,
		isTablet,
		isDesktop,
		isMobile,
		isWeb,
		responsive,
	};
};
