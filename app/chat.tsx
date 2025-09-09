import React, { useState, useRef, useEffect } from "react";
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

	useEffect(() => {
		// Auto-join a default room for demo
		joinRoom("general", "General Chat");
	}, [joinRoom]);
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
	const renderMessage = ({ item }: { item: ChatMessage }) => {
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
	return (
		<SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className="flex-1"
			>
				{/* Header */}
				<View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
					<Text className="text-lg font-semibold text-gray-800 dark:text-white">
						General Chat
					</Text>
					<Text className="text-sm text-gray-500 dark:text-gray-400">
						{typingUsers.length > 0
							? `${typingUsers.length} person${typingUsers.length > 1 ? "s" : ""} typing...`
							: "Tap to see room info"}
					</Text>
				</View>
				{/* Messages */}
				<FlatList
					ref={flatListRef}
					data={messages}
					renderItem={renderMessage}
					keyExtractor={(item, index) => item.id ?? `msg_${index}`} // fallback to index if id missing
					className="flex-1 px-4"
					contentContainerStyle={{ paddingVertical: 16 }}
					onEndReached={loadMoreMessages}
					onEndReachedThreshold={0.1}
					ListFooterComponent={renderTypingIndicator}
				/>
				{/* Input */}
				<View className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
					<View className="flex-row items-end">
						<TextInput
							className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 mr-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
							placeholder="Type a message..."
							placeholderTextColor="#9CA3AF"
							value={inputText}
							onChangeText={handleTextChange}
							onSubmitEditing={handleSendMessage}
							onBlur={handleStopTyping}
							multiline
							maxLength={1000}
						/>
						<TouchableOpacity
							className={`rounded-full p-2 ${
								inputText.trim()
									? "bg-blue-500 active:bg-blue-600"
									: "bg-gray-300 dark:bg-gray-600"
							}`}
							onPress={handleSendMessage}
							disabled={!inputText.trim()}
						>
							<Text className="text-white font-semibold px-2">Send</Text>
						</TouchableOpacity>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
const styles = StyleSheet.create({
	container: { flex: 1 },
	centered: { justifyContent: "center", alignItems: "center" },
	taskItem: {
		padding: 16,
		margin: 8,
		borderRadius: 8,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	taskActions: { flexDirection: "row", alignItems: "center" },
	deleteButton: { fontSize: 20, marginRight: 10 },
	taskStatus: { fontSize: 24 },
	addButton: {
		backgroundColor: "#007AFF",
		margin: 16,
		padding: 16,
		borderRadius: 8,
		alignItems: "center",
	},
	addButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
	emptyState: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingTop: 100,
	},
	emptyText: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#666",
		marginBottom: 8,
	},
	emptySubtext: { fontSize: 14, color: "#999" },
	errorText: { color: "red", fontSize: 16 },
	connectionStatusText: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 8,
	},
});
