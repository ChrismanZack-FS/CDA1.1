import { useState, useEffect, useCallback } from "react";
import {
	chatService,
	ChatMessage,
	ChatRoom,
	TypingUser,
} from "../services/chatService";
export interface UseChatReturn {
	messages: ChatMessage[];
	typingUsers: TypingUser[];
	rooms: ChatRoom[];
	currentRoom: string | null;
	isLoading: boolean;
	sendMessage: (text: string) => Promise<void>;
	joinRoom: (roomId: string, roomName: string) => Promise<void>;
	startTyping: () => void;
	stopTyping: () => void;
	loadMoreMessages: () => Promise<void>;
}
export const useChat = (userId: string, userName: string): UseChatReturn => {
	const [messages, setMessages] = useState<ChatMessage[]>([]);

	const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
	const [rooms, setRooms] = useState<ChatRoom[]>([]);
	const [currentRoom, setCurrentRoom] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [messageOffset, setMessageOffset] = useState(0);
	useEffect(() => {
		initializeChat();
	}, [userId, userName]);
	const initializeChat = async () => {
		try {
			setIsLoading(true);
			await chatService.initialize(userId, userName);

			// Load existing rooms
			const existingRooms = await chatService.getAllRooms();
			console.log("Rooms fetched from DB:", existingRooms);
			setRooms(existingRooms);

			// Load messages for persistent room after initialization
			const lastRoomId = chatService.getCurrentRoomId();
			if (!currentRoom && lastRoomId) {
				const roomMessages = await chatService.getMessagesForRoom(lastRoomId);
				setMessages(roomMessages);
				setMessageOffset(roomMessages.length);
				// DO NOT setCurrentRoom here
			}

			// Set up event listeners
			const unsubscribeMessage = chatService.onMessage((message) => {
				setMessages((prev) => {
					// Remove any message with the same id or tempId
					const filtered = prev.filter(
						(m) => m.id !== message.id && m.tempId !== message.tempId
					);
					return [...filtered, message];
				});
			});
			const unsubscribeTyping = chatService.onTyping((typingUser) => {
				setTypingUsers((prev) => {
					const filtered = prev.filter((u) => u.userId !== typingUser.userId);
					return typingUser.isTyping ? [...filtered, typingUser] : filtered;
				});
			});
			const unsubscribeDelivery = chatService.onDelivery(
				(tempId, messageId) => {
					setMessages((prev) => {
						// Remove any message with the matching tempId
						const filtered = prev.filter((m) => m.tempId !== tempId);
						// Find the delivered message
						const deliveredMsg = prev.find((m) => m.tempId === tempId);
						if (deliveredMsg) {
							return [
								...filtered,
								{
									...deliveredMsg,
									id: messageId,
									delivered: true,
									tempId: undefined,
								},
							];
						}
						return filtered;
					});
				}
			);
			// Listen for room join and update currentRoom
			// Remove auto-switching to message.roomId on incoming message
			// Instead, rely on unreadCount and UI indicator
			const unsubscribeRoomJoin = () => {};
			return () => {
				unsubscribeMessage();
				unsubscribeTyping();
				unsubscribeDelivery();
				unsubscribeRoomJoin();
			};
		} catch (error) {
			console.error("Error initializing chat:", error);
		} finally {
			setIsLoading(false);
		}
	};
	const joinRoom = useCallback(async (roomId: string, roomName: string) => {
		try {
			setIsLoading(true);
			await chatService.joinRoom(roomId, roomName);

			// Load messages for this room
			let roomMessages = await chatService.getMessagesForRoom(roomId);
			// Deduplicate loaded messages
			const uniqueMessages = [];
			const seen = new Set();
			for (const msg of roomMessages) {
				const key = msg.id || msg.tempId;
				if (!seen.has(key)) {
					uniqueMessages.push(msg);
					seen.add(key);
				}
			}
			setMessages(uniqueMessages);
			setCurrentRoom(roomId);
			setMessageOffset(uniqueMessages.length);

			// Clear typing indicators when switching rooms
			setTypingUsers([]);
		} catch (error) {
			console.error("Error joining room:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);
	const sendMessage = useCallback(async (text: string) => {
		try {
			await chatService.sendMessage(text);
		} catch (error) {
			console.error("Error sending message:", error);
		}
	}, []);
	const startTyping = useCallback(() => {
		chatService.startTyping();
	}, []);
	const stopTyping = useCallback(() => {
		chatService.stopTyping();
	}, []);
	const loadMoreMessages = useCallback(async () => {
		if (!currentRoom || isLoading) return;

		try {
			setIsLoading(true);
			const olderMessages = await chatService.getMessagesForRoom(
				currentRoom,
				20,
				messageOffset
			);

			if (olderMessages.length > 0) {
				setMessages((prev) => [...olderMessages, ...prev]);
				setMessageOffset((prev) => prev + olderMessages.length);
			}
		} catch (error) {
			console.error("Error loading more messages:", error);
		} finally {
			setIsLoading(false);
		}
	}, [currentRoom, messageOffset, isLoading]);
	return {
		messages,
		typingUsers,
		rooms,
		currentRoom,
		isLoading,
		sendMessage,
		joinRoom,
		startTyping,
		stopTyping,
		loadMoreMessages,
	};
};
