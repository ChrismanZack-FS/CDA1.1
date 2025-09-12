import React, { useState, useRef, useEffect } from "react";
import { Platform } from "react-native";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	FlatList,
	KeyboardAvoidingView,
	StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useChat } from "../hooks/useChat";
import { ChatMessage } from "../services/chatDatabase";
import { useEffect as useReactEffect } from "react";
import { useUserPreferences } from "../hooks/useUserPreferences";

// Generate a unique user ID based on username (stable per user)
function getUserId(username: string | null) {
	if (!username) return "user_anon";
	// Simple hash for demo purposes
	let hash = 0;
	for (let i = 0; i < username.length; i++) {
		hash = (hash << 5) - hash + username.charCodeAt(i);
		hash |= 0;
	}
	return `user_${Math.abs(hash)}`;
}

export default function ChatScreen() {
	// Get username from settings
	const { preferences } = useUserPreferences();
	const CURRENT_USER_NAME = preferences.username || "User";
	const CURRENT_USER_ID = getUserId(preferences.username);

	// Render a single chat message
	const renderMessage = ({ item }: { item: ChatMessage }) => {
		const isOwnMessage = item.userId === CURRENT_USER_ID;
		return (
			<View
				style={{
					backgroundColor: isOwnMessage ? "#007AFF" : "#eee",
					alignSelf: isOwnMessage ? "flex-end" : "flex-start",
					marginBottom: 8,
					borderRadius: 16,
					padding: 12,
					maxWidth: "80%",
				}}
			>
				<Text
					style={{
						color: isOwnMessage ? "#fff" : "#333",
						fontSize: 16,
					}}
				>
					{item.text}
				</Text>
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
						marginTop: 4,
					}}
				>
					<Text
						style={{ color: isOwnMessage ? "#cce6ff" : "#666", fontSize: 12 }}
					>
						{new Date(item.timestamp).toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</Text>
					{isOwnMessage && (
						<Text style={{ color: "#cce6ff", fontSize: 12, marginLeft: 8 }}>
							{item.delivered ? "✓✓" : "✓"}
						</Text>
					)}
				</View>
			</View>
		);
	};
	const [inputText, setInputText] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const flatListRef = useRef<FlatList>(null);

	const {
		messages,
		typingUsers,
		rooms,
		currentRoom,
		sendMessage,
		joinRoom,
		startTyping,
		stopTyping,
		loadMoreMessages,
	} = useChat(CURRENT_USER_ID, CURRENT_USER_NAME);

	useEffect(() => {
		console.log("[chat.tsx] typingUsers updated:", typingUsers);
	}, [typingUsers]);

	// Room joining is now handled by chatService initialization (via useChat)
	useEffect(() => {
		// Scroll to bottom when new messages arrive
		if (messages.length > 0) {
			setTimeout(() => {
				flatListRef.current?.scrollToEnd({ animated: true });
			}, 100);
		}
	}, [messages]);
	useEffect(() => {
		console.log("Rooms in UI:", rooms);
	}, [rooms]);
	const handleSendMessage = async () => {
		if (!inputText.trim()) return;
		if (!currentRoom) {
			alert("Please select a room before sending a message.");
			return;
		}
		await sendMessage(inputText.trim());
		setInputText("");
		handleStopTyping();
	};
	const handleTextChange = (text: string) => {
		setInputText(text);
		if (!currentRoom) return;
		if (text.length > 0 && !isTyping) {
			setIsTyping(true);
			startTyping();
		} else if (text.length === 0 && isTyping) {
			handleStopTyping();
		}
	};
	const handleStopTyping = () => {
		if (isTyping && currentRoom) {
			setIsTyping(false);
			stopTyping();
		}
	};

	const renderTypingIndicator = () => {
		if (typingUsers.length === 0) {
			return null;
		}
		const typingNames = typingUsers.map((u: any) => u.userName).join(", ");
		return (
			<View style={{ alignItems: "flex-start", marginBottom: 12 }}>
				<View
					style={{
						backgroundColor: "#eee",
						borderRadius: 16,
						paddingHorizontal: 12,
						paddingVertical: 6,
					}}
				>
					<Text style={{ color: "#666", fontSize: 14 }}>
						{typingNames} {typingUsers.length === 1 ? "is" : "are"} typing...
					</Text>
				</View>
			</View>
		);
	};

	// Deduplicate and filter messages by current room before rendering
	const dedupedMessages = Array.from(
		new Map(messages.map((msg: ChatMessage) => [msg.id, msg])).values()
	).filter((msg: ChatMessage) => msg.roomId === currentRoom);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
			>
				<View style={{ flex: 1 }}>
					{/*could not get unread indicator to work properly*/}
					{/* Channel selector at the top with unread indicator */}
					<View
						style={{ flexDirection: "row", marginBottom: 8, paddingTop: 8 }}
					>
						{rooms.map((room) => {
							const isActive = room.id === currentRoom;
							const hasUnread = room.unreadCount > 0;
							return (
								<TouchableOpacity
									key={room.id}
									onPress={() => joinRoom(room.id, room.name)}
									style={{
										marginRight: 12,
										paddingVertical: 6,
										paddingHorizontal: 14,
										borderRadius: 16,
										backgroundColor: isActive ? "#007AFF" : "#eee",
										position: "relative",
										// Add red glow if has unread and not active
										shadowColor: hasUnread && !isActive ? "red" : undefined,
										shadowOffset:
											hasUnread && !isActive
												? { width: 0, height: 0 }
												: undefined,
										shadowOpacity: hasUnread && !isActive ? 0.8 : 0,
										shadowRadius: hasUnread && !isActive ? 8 : 0,
										borderWidth: hasUnread && !isActive ? 2 : 0,
										borderColor: hasUnread && !isActive ? "red" : "transparent",
									}}
								>
									<Text
										style={{
											color: isActive ? "#fff" : "#333",
											fontWeight: "bold",
										}}
									>
										{room.name}
									</Text>
									{hasUnread && (
										<View
											style={{
												position: "absolute",
												top: -4,
												right: -4,
												backgroundColor: "red",
												borderRadius: 8,
												paddingHorizontal: 6,
												paddingVertical: 2,
												minWidth: 16,
												alignItems: "center",
											}}
										>
											<Text
												style={{
													color: "#fff",
													fontSize: 12,
													fontWeight: "bold",
												}}
											>
												{room.unreadCount}
											</Text>
										</View>
									)}
								</TouchableOpacity>
							);
						})}
					</View>
					{/* Typing indicator above message list */}
					{renderTypingIndicator()}
					<FlatList
						ref={flatListRef}
						data={dedupedMessages}
						renderItem={renderMessage}
						keyExtractor={(item) => item.id}
						style={{ flex: 1 }}
						contentContainerStyle={{ padding: 8 }}
					/>
					<View
						style={{
							flexDirection: "row",
							padding: 8,
							borderTopWidth: 1,
							borderColor: "#eee",
							backgroundColor: "#fff",
						}}
					>
						<TextInput
							style={{
								flex: 1,
								borderWidth: 1,
								borderColor: "#ccc",
								borderRadius: 20,
								paddingHorizontal: 12,
								paddingVertical: 8,
								marginRight: 8,
							}}
							placeholder="Type a message..."
							value={inputText}
							onChangeText={handleTextChange}
							onSubmitEditing={handleSendMessage}
							multiline
						/>
						<TouchableOpacity
							style={{
								backgroundColor: !inputText.trim() ? "#ccc" : "#007AFF",
								borderRadius: 20,
								paddingHorizontal: 16,
								paddingVertical: 10,
								justifyContent: "center",
								alignItems: "center",
							}}
							onPress={handleSendMessage}
							disabled={!inputText.trim()}
						>
							<Text style={{ color: "#fff", fontWeight: "bold" }}>Send</Text>
						</TouchableOpacity>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
