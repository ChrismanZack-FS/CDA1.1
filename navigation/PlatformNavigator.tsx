import React from "react";
import { useResponsive } from "../hooks/useResponsive";
import { MobileNavigator } from "./MobileNavigator";
import { TabletNavigator } from "./TabletNavigator";
import { DesktopNavigator } from "./DesktopNavigator";

export const PlatformNavigator: React.FC = () => {
	const { isDesktop, isTablet } = useResponsive();
	if (isDesktop) {
		return <DesktopNavigator />;
	} else if (isTablet) {
		return <TabletNavigator />;
	} else {
		return <MobileNavigator />;
	}
};
