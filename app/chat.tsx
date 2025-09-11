import React, { useState, useRef, useEffect } from "react";
import secureStorageService from "../services/secureStorage";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	FlatList,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useChat } from "../hooks/useChat";
import { ChatMessage } from "../services/chatDatabase";

// You would get these from user authentication
const CURRENT_USER_ID = "user_123";
const CURRENT_USER_NAME = "John Doe";
export default function ChatScreen() {
	const [inputText, setInputText] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const flatListRef = useRef<FlatList>(null);

	const {
		messages,
		typingUsers,
		currentRoom,
		sendMessage,
		joinRoom,
		startTyping,
		stopTyping,
		loadMoreMessages,
	} = useChat(CURRENT_USER_ID, CURRENT_USER_NAME);

	// Room joining is now handled by chatService initialization (via useChat)
	useEffect(() => {
		// Scroll to bottom when new messages arrive
		if (messages.length > 0) {
			setTimeout(() => {
				flatListRef.current?.scrollToEnd({ animated: true });
			}, 100);
		}
	}, [messages]);
	const handleSendMessage = async () => {
		if (!inputText.trim()) return;

		await sendMessage(inputText.trim());
		setInputText("");
		handleStopTyping();
	};
	const handleTextChange = (text: string) => {
		setInputText(text);

		if (text.length > 0 && !isTyping) {
			setIsTyping(true);
			startTyping();
		} else if (text.length === 0 && isTyping) {
			handleStopTyping();
		}
	};
	const handleStopTyping = () => {
		if (isTyping) {
			setIsTyping(false);
			stopTyping();
		}
	};
	const renderMessage = ({ item }: { item: ChatMessage | any }) => {
		if (item.type === "typing") {
			const typingNames = item.users.map((u: any) => u.userName).join(", ");
			return (
				<View key={item.id} className="items-start mb-3">
					<View className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-2">
						<Text className="text-gray-600 dark:text-gray-300 text-sm">
							{typingNames} {item.users.length === 1 ? "is" : "are"} typing...
						</Text>
					</View>
				</View>
			);
		}

		const isOwnMessage = item.userId === CURRENT_USER_ID;

		return (
			<View
				className={`flex-row ${isOwnMessage ? "justify-end" : "justify-start"}`}
			>
				<View className={`mb-3 ${isOwnMessage ? "items-end" : "items-start"}`}>
					{!isOwnMessage && (
						<Text className="text-sm text-gray-600 dark:text-gray-300 mb-1">
							{item.userName}
						</Text>
					)}
					<View
						className={`max-w-3/4 p-3 rounded-2xl ${
							isOwnMessage
								? "bg-blue-500 rounded-br-md"
								: "bg-gray-200 dark:bg-gray-700 rounded-bl-md"
						}`}
					>
						<Text
							className={`text-base ${
								isOwnMessage ? "text-white" : "text-gray-800 dark:text-white"
							}`}
						>
							{item.text}
						</Text>
						<View className="flex-row items-center justify-between mt-1">
							<Text
								className={`text-xs ${
									isOwnMessage
										? "text-blue-100"
										: "text-gray-500 dark:text-gray-400"
								}`}
							>
								{new Date(item.timestamp).toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</Text>
							{isOwnMessage && (
								<Text className="text-xs text-blue-100 ml-2">
									{item.delivered ? "✓✓" : "✓"}
								</Text>
							)}
						</View>
					</View>
				</View>
			</View>
		);
	};
	const renderTypingIndicator = () => {
		if (typingUsers.length === 0) return null;

		const typingNames = typingUsers.map((u) => u.userName).join(", ");

		return (
			<View className="items-start mb-3">
				<View className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-2">
					<Text className="text-gray-600 dark:text-gray-300 text-sm">
						{typingNames} {typingUsers.length === 1 ? "is" : "are"} typing...
					</Text>
				</View>
			</View>
		);
	};

	// Deduplicate messages by id before rendering
	const dedupedMessages = Array.from(
		new Map(messages.map((msg) => [msg.id, msg])).values()
	);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
			>
				<View style={{ flex: 1 }}>
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
								backgroundColor: "#007AFF",
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
