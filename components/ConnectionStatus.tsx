import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useUserPreferences } from "../hooks/useUserPreferences";
import { designTokens } from "../theme/designTokens";
import {
	connectionManager,
	ConnectionState,
	ConnectionInfo,
	QueuedOperation,
} from "../services/connectionManager";

export const ConnectionStatus: React.FC = () => {
	const { preferences } = useUserPreferences();
	const theme = preferences.theme === "dark" ? "dark" : "light";
	const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>(
		connectionManager.getConnectionInfo()
	);
	const [queuedOps, setQueuedOps] = useState<QueuedOperation[]>([]);
	const [isExpanded, setIsExpanded] = useState(false);
	const [fadeAnim] = useState(new Animated.Value(1));

	useEffect(() => {
		const unsubscribeConnection =
			connectionManager.onConnectionChange(setConnectionInfo);
		const unsubscribeQueue = connectionManager.onQueueChange(setQueuedOps);

		// Force refresh of connection state immediately after subscribing
		setConnectionInfo(connectionManager.getConnectionInfo());
		connectionManager.ensureConnectedState();
		return () => {
			unsubscribeConnection();
			unsubscribeQueue();
		};
	}, []);

	useEffect(() => {
		// Animate connection state changes
		Animated.sequence([
			Animated.timing(fadeAnim, {
				toValue: 0.3,
				duration: 200,
				useNativeDriver: true,
			}),
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}),
		]).start();

		// Debug: Log connection state received by UI
		console.log(
			"[ConnectionStatus] Received connection state:",
			connectionInfo.state
		);
	}, [connectionInfo.state]);

	const getStatusColors = () => {
		if (connectionInfo.state === ConnectionState.CONNECTED) {
			return {
				backgroundColor:
					theme === "dark"
						? designTokens.colors.semantic.success + "22"
						: designTokens.colors.semantic.success + "22",
				borderColor:
					theme === "dark"
						? designTokens.colors.semantic.success
						: designTokens.colors.semantic.success,
			};
		}
		if (
			connectionInfo.state === ConnectionState.CONNECTING ||
			connectionInfo.state === ConnectionState.RECONNECTING
		) {
			return {
				backgroundColor:
					theme === "dark"
						? designTokens.colors.semantic.warning + "22"
						: designTokens.colors.semantic.warning + "22",
				borderColor:
					theme === "dark"
						? designTokens.colors.semantic.warning
						: designTokens.colors.semantic.warning,
			};
		}
		if (
			connectionInfo.state === ConnectionState.DISCONNECTED ||
			connectionInfo.state === ConnectionState.FAILED
		) {
			return {
				backgroundColor:
					theme === "dark"
						? designTokens.colors.semantic.error + "22"
						: designTokens.colors.semantic.error + "22",
				borderColor:
					theme === "dark"
						? designTokens.colors.semantic.error
						: designTokens.colors.semantic.error,
			};
		}
		return {
			backgroundColor:
				theme === "dark"
					? designTokens.colors.neutral[900]
					: designTokens.colors.neutral[100],
			borderColor:
				theme === "dark"
					? designTokens.colors.neutral[700]
					: designTokens.colors.neutral[200],
		};
	};

	const getStatusText = () => {
		switch (connectionInfo.state) {
			case ConnectionState.CONNECTED:
				return queuedOps.length > 0
					? `Connected • ${queuedOps.length} pending`
					: "Connected • Live sync active";
			case ConnectionState.CONNECTING:
				return "Connecting...";
			case ConnectionState.RECONNECTING:
				return `Reconnecting... (attempt ${connectionInfo.reconnectAttempt + 1})`;
			case ConnectionState.DISCONNECTED:
				return connectionInfo.isOnline ? "Disconnected" : "Offline";
			case ConnectionState.FAILED:
				return "Connection failed";
			default:
				return "Unknown status";
		}
	};

	const getStatusIcon = () => {
		switch (connectionInfo.state) {
			case ConnectionState.CONNECTED:
				return "🟢";
			case ConnectionState.CONNECTING:
			case ConnectionState.RECONNECTING:
				return "🟡";
			case ConnectionState.DISCONNECTED:
			case ConnectionState.FAILED:
				return "🔴";
			default:
				return "⚪";
		}
	};

	const handleRetryConnection = () => {
		connectionManager.connect();
	};

	const formatLatency = (latency?: number) => {
		if (!latency) return "Unknown";
		if (latency < 100) return `${latency}ms (Excellent)`;
		if (latency < 300) return `${latency}ms (Good)`;
		if (latency < 1000) return `${latency}ms (Fair)`;
		return `${latency}ms (Poor)`;
	};

	const statusColors = getStatusColors();
	return (
		<Animated.View style={{ opacity: fadeAnim }}>
			<TouchableOpacity
				style={{
					borderRadius: designTokens.borderRadius.lg,
					padding: designTokens.spacing.md,
					marginBottom: designTokens.spacing.md,
					borderWidth: 1,
					backgroundColor: statusColors.backgroundColor,
					borderColor: statusColors.borderColor,
				}}
				onPress={() => setIsExpanded(!isExpanded)}
				activeOpacity={0.7}
			>
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
						<Text
							style={{
								fontSize: designTokens.typography.fontSize.xl,
								marginRight: designTokens.spacing.sm,
								fontFamily: designTokens.typography.fontFamily.sans,
							}}
						>
							{getStatusIcon()}
						</Text>
						<View style={{ flex: 1 }}>
							<Text
								style={{
									fontWeight: "500",
									color:
										theme === "dark"
											? designTokens.colors.neutral[50]
											: designTokens.colors.neutral[900],
									fontFamily: designTokens.typography.fontFamily.sans,
									fontSize: designTokens.typography.fontSize.lg,
								}}
							>
								Real-Time Status
							</Text>
							<Text
								style={{
									color:
										theme === "dark"
											? designTokens.colors.neutral[100]
											: designTokens.colors.neutral[500],
									fontFamily: designTokens.typography.fontFamily.sans,
									fontSize: designTokens.typography.fontSize.base,
								}}
							>
								{getStatusText()}
							</Text>
						</View>
					</View>
					{(connectionInfo.state === ConnectionState.FAILED ||
						connectionInfo.state === ConnectionState.DISCONNECTED) && (
						<TouchableOpacity
							style={{
								backgroundColor: designTokens.colors.primary[500],
								borderRadius: designTokens.borderRadius.md,
								paddingHorizontal: designTokens.spacing.md,
								paddingVertical: designTokens.spacing.xs,
								marginLeft: designTokens.spacing.sm,
							}}
							onPress={handleRetryConnection}
						>
							<Text
								style={{
									color: "white",
									fontSize: designTokens.typography.fontSize.sm,
									fontWeight: "500",
									fontFamily: designTokens.typography.fontFamily.sans,
								}}
							>
								Retry
							</Text>
						</TouchableOpacity>
					)}
				</View>
				{isExpanded && (
					<View
						style={{
							marginTop: designTokens.spacing.md,
							paddingTop: designTokens.spacing.md,
							borderTopWidth: 1,
							borderTopColor:
								theme === "dark"
									? designTokens.colors.neutral[700]
									: designTokens.colors.neutral[200],
						}}
					>
						<View>
							<View
								style={{
									flexDirection: "row",
									justifyContent: "space-between",
								}}
							>
								<Text
									style={{
										fontSize: designTokens.typography.fontSize.sm,
										color:
											theme === "dark"
												? designTokens.colors.neutral[100]
												: designTokens.colors.neutral[500],
										fontFamily: designTokens.typography.fontFamily.sans,
									}}
								>
									Network:
								</Text>
								<Text
									style={{
										fontSize: designTokens.typography.fontSize.sm,
										color:
											theme === "dark"
												? designTokens.colors.neutral[50]
												: designTokens.colors.neutral[900],
										fontFamily: designTokens.typography.fontFamily.sans,
									}}
								>
									{connectionInfo.isOnline ? "Online" : "Offline"}
								</Text>
							</View>
							{connectionInfo.latency && (
								<View
									style={{
										flexDirection: "row",
										justifyContent: "space-between",
									}}
								>
									<Text
										style={{
											fontSize: designTokens.typography.fontSize.sm,
											color:
												theme === "dark"
													? designTokens.colors.neutral[100]
													: designTokens.colors.neutral[500],
											fontFamily: designTokens.typography.fontFamily.sans,
										}}
									>
										Latency:
									</Text>
									<Text
										style={{
											fontSize: designTokens.typography.fontSize.sm,
											color:
												theme === "dark"
													? designTokens.colors.neutral[50]
													: designTokens.colors.neutral[900],
											fontFamily: designTokens.typography.fontFamily.sans,
										}}
									>
										{formatLatency(connectionInfo.latency)}
									</Text>
								</View>
							)}
							{connectionInfo.lastConnected && (
								<View
									style={{
										flexDirection: "row",
										justifyContent: "space-between",
									}}
								>
									<Text
										style={{
											fontSize: designTokens.typography.fontSize.sm,
											color:
												theme === "dark"
													? designTokens.colors.neutral[100]
													: designTokens.colors.neutral[500],
											fontFamily: designTokens.typography.fontFamily.sans,
										}}
									>
										Last Connected:
									</Text>
									<Text
										style={{
											fontSize: designTokens.typography.fontSize.sm,
											color:
												theme === "dark"
													? designTokens.colors.neutral[50]
													: designTokens.colors.neutral[900],
											fontFamily: designTokens.typography.fontFamily.sans,
										}}
									>
										{connectionInfo.lastConnected.toLocaleTimeString()}
									</Text>
								</View>
							)}
							{queuedOps.length > 0 && (
								<View style={{ marginTop: designTokens.spacing.sm }}>
									<Text
										style={{
											fontSize: designTokens.typography.fontSize.sm,
											fontWeight: "500",
											color:
												theme === "dark"
													? designTokens.colors.neutral[50]
													: designTokens.colors.neutral[900],
											fontFamily: designTokens.typography.fontFamily.sans,
											marginBottom: designTokens.spacing.xs,
										}}
									>
										Pending Operations:
									</Text>
									{queuedOps.slice(0, 3).map((op, index) => (
										<Text
											key={op.id}
											style={{
												fontSize: designTokens.typography.fontSize.xs,
												color:
													theme === "dark"
														? designTokens.colors.neutral[100]
														: designTokens.colors.neutral[500],
												fontFamily: designTokens.typography.fontFamily.sans,
											}}
										>
											• {op.operation.type} (retry {op.retryCount}/
											{op.maxRetries})
										</Text>
									))}
									{queuedOps.length > 3 && (
										<Text
											style={{
												fontSize: designTokens.typography.fontSize.xs,
												color:
													theme === "dark"
														? designTokens.colors.neutral[100]
														: designTokens.colors.neutral[500],
												fontFamily: designTokens.typography.fontFamily.sans,
											}}
										>
											... and {queuedOps.length - 3} more
										</Text>
									)}
								</View>
							)}
						</View>
					</View>
				)}
			</TouchableOpacity>
		</Animated.View>
	);
};
