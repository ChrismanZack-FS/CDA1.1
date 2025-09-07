import { useEffect, useState } from "react";
import { Dimensions } from "react-native";
type Breakpoint = "sm" | "md" | "lg" | "xl";
const breakpoints = {
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
};
export function useBreakpoint(): Breakpoint {
	const [breakpoint, setBreakpoint] = useState<Breakpoint>("sm");
	useEffect(() => {
		const updateBreakpoint = () => {
			const { width } = Dimensions.get("window");

			if (width >= breakpoints.xl) {
				setBreakpoint("xl");
			} else if (width >= breakpoints.lg) {
				setBreakpoint("lg");
			} else if (width >= breakpoints.md) {
				setBreakpoint("md");
			} else {
				setBreakpoint("sm");
			}
		};
		updateBreakpoint();

		const subscription = Dimensions.addEventListener(
			"change",
			updateBreakpoint
		);
		return () => subscription?.remove();
	}, []);
	return breakpoint;
}
