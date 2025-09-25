import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useResponsive } from "../../hooks/useResponsive";
import { designTokens } from "../../theme/designTokens";
interface ResponsiveLayoutProps {
	children: React.ReactNode;
	maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
	padding?: boolean;
	scrollable?: boolean;
	sidebarContent?: React.ReactNode;
	headerContent?: React.ReactNode;
}
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
	children,
	maxWidth = "lg",
	padding = true,
	scrollable = true,
	sidebarContent,
	headerContent,
}) => {
	const { breakpoint, isDesktop, isTablet, responsive } = useResponsive();
	const getLayoutStyle = () => {
		if (isDesktop && sidebarContent) {
			return styles.desktopSidebarLayout;
		} else if (isTablet) {
			return styles.tabletLayout;
		} else {
			return styles.mobileLayout;
		}
	};
	const getContentWidth = () => {
		const maxWidths = {
			sm: 640,
			md: 768,
			lg: 1024,
			xl: 1280,
			full: 1440,
		};
		return maxWidths[maxWidth];
	};
	const contentPadding = padding
		? responsive({
				xs: designTokens.spacing.md,
				sm: designTokens.spacing.lg,
				lg: designTokens.spacing.xl,
			})
		: 0;
	const Container = scrollable ? ScrollView : View;
	if (isDesktop && sidebarContent) {
		return (
			<View style={styles.desktopContainer}>
				{/* Sidebar */}
				<View style={styles.sidebar}>{sidebarContent}</View>

				{/* Main content area */}
				<View style={styles.mainContent}>
					{headerContent && <View style={styles.header}>{headerContent}</View>}

					<Container
						style={[styles.contentContainer, { padding: contentPadding }]}
						contentContainerStyle={scrollable ? { flexGrow: 1 } : undefined}
					>
						<View style={[styles.content, { maxWidth: getContentWidth() }]}>
							{children}
						</View>
					</Container>
				</View>
			</View>
		);
	}
	return (
		<View style={styles.container}>
			{headerContent && <View style={styles.header}>{headerContent}</View>}

			<Container
				style={[styles.contentContainer, { padding: contentPadding }]}
				contentContainerStyle={scrollable ? { flexGrow: 1 } : undefined}
			>
				<View style={[styles.content, { maxWidth: getContentWidth() }]}>
					{children}
				</View>
			</Container>
		</View>
	);
};
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: designTokens.colors.neutral[50],
	},
	desktopContainer: {
		flex: 1,
		flexDirection: "row",
		backgroundColor: designTokens.colors.neutral[50],
	},
	sidebar: {
		width: 280,
		backgroundColor: designTokens.colors.neutral[100],
		borderRightWidth: 1,
		borderRightColor: designTokens.colors.neutral[500],
	},
	mainContent: {
		flex: 1,
	},
	header: {
		backgroundColor: designTokens.colors.neutral[100],
		borderBottomWidth: 1,
		borderBottomColor: designTokens.colors.neutral[500],
		paddingVertical: designTokens.spacing.md,
		paddingHorizontal: designTokens.spacing.lg,
	},
	contentContainer: {
		flex: 1,
	},
	content: {
		flex: 1,
		alignSelf: "center",
		width: "100%",
	},
	desktopSidebarLayout: {
		flexDirection: "row",
	},
	tabletLayout: {
		flexDirection: "column",
	},
	mobileLayout: {
		flexDirection: "column",
	},
});
