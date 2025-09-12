import { socketService } from "./socketService";
import { chatDatabaseService, ChatMessage, ChatRoom } from "./chatDatabase";
import secureStorageService from "./secureStorage";
export interface TypingUser {
	userId: string;
	userName: string;
	isTyping: boolean;
	timestamp: string;
}
export interface ChatUser {
	userId: string;
	userName: string;
	socketId?: string;
	isOnline: boolean;
}
class ChatService {
	private currentUserId: string | null = null;
	private currentUserName: string | null = null;
	private currentRoomId: string | null = null;
	private typingTimeout: ReturnType<typeof setTimeout> | null = null;
	// Event listeners
	private messageListeners: ((message: ChatMessage) => void)[] = [];
	private typingListeners: ((typingUser: TypingUser) => void)[] = [];
	private presenceListeners: ((users: ChatUser[]) => void)[] = [];
	private deliveryListeners: ((tempId: string, messageId: string) => void)[] =
		[];
	async initialize(userId: string, userName: string): Promise<void> {
		console.log("[chatService] initialize called with:", userId, userName);
		this.currentUserId = userId;
		this.currentUserName = userName;

		await chatDatabaseService.initializeDatabase();
		this.setupSocketListeners();

		// Wait for socket to connect before emitting events
		const emitOnConnect = async () => {
			socketService.emit("user_join", {
				userId,
				userName,
				timestamp: new Date().toISOString(),
			});
			const lastRoomId = await secureStorageService.getItem("lastRoomId");
			const lastRoomName = await secureStorageService.getItem("lastRoomName");
			console.log(
				"[chatService] emitOnConnect lastRoomId:",
				lastRoomId,
				"lastRoomName:",
				lastRoomName
			);
			if (lastRoomId && lastRoomName) {
				console.log("[chatService] Calling joinRoom from emitOnConnect");
				await this.joinRoom(lastRoomId, lastRoomName);
			} else {
				console.log(
					"[chatService] No persistent room found, joining default room"
				);
				await this.joinRoom("general", "General Chat");
			}
		};
		if (socketService.isConnected()) {
			await emitOnConnect();
		} else {
			socketService.on("connect", emitOnConnect);
		}
	}
	private setupSocketListeners(): void {
		// Handle new messages
		socketService.on("new_message", (message: ChatMessage) => {
			this.handleNewMessage(message);
		});
		// Handle typing indicators
		socketService.on("user_typing", (data: TypingUser) => {
			console.log("[chatService] Received user_typing event", data);
			this.notifyTypingListeners(data);
		});
		// Handle message delivery confirmation
		socketService.on(
			"message_delivered",
			(data: { tempId: string; messageId: string; timestamp: string }) => {
				this.handleMessageDelivered(data.tempId, data.messageId);
			}
		);
		// Handle room joined
		socketService.on(
			"room_joined",
			async (data: {
				roomId: string;
				messages: ChatMessage[];
				participants: ChatUser[];
			}) => {
				await this.handleRoomJoined(data);
			}
		);
		// Handle user presence
		socketService.on("user_joined_room", (data: ChatUser) => {
			// Handle user joining room
		});
		socketService.on("user_left_room", (data: ChatUser) => {
			// Handle user leaving room
		});
	}
	async joinRoom(roomId: string, roomName: string): Promise<void> {
		console.log("[chatService] joinRoom called with:", roomId, roomName);
		this.currentRoomId = roomId;
		await secureStorageService.setItem("lastRoomId", roomId);
		await secureStorageService.setItem("lastRoomName", roomName);
		await chatDatabaseService.createOrUpdateRoom({
			id: roomId,
			name: roomName,
			unreadCount: 0,
			participants: [this.currentUserId!],
		});
		// Wait for socket to connect before emitting join_room
		const emitJoinRoom = () => {
			socketService.emit("join_room", {
				roomId,
				userId: this.currentUserId,
				userName: this.currentUserName,
			});
		};
		if (socketService.isConnected()) {
			emitJoinRoom();
		} else {
			socketService.on("connect", emitJoinRoom);
		}
	}
	async sendMessage(text: string): Promise<void> {
		if (!this.currentRoomId || !this.currentUserId || !this.currentUserName) {
			throw new Error("Not connected to a room");
		}
		const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const message: ChatMessage = {
			id: tempId, // Will be replaced when server confirms
			tempId,
			roomId: this.currentRoomId,
			userId: this.currentUserId,
			userName: this.currentUserName,
			text,
			timestamp: new Date().toISOString(),
			delivered: false,
			read: true, // Own messages are considered read
			type: "text",
		};
		// Save optimistically to local database
		await chatDatabaseService.saveMessage(message);

		// Notify UI immediately
		this.notifyMessageListeners(message);
		// Send to server
		socketService.emit("send_message", {
			roomId: this.currentRoomId,
			message: {
				tempId,
				userId: this.currentUserId,
				userName: this.currentUserName,
				text,
				type: "text",
			},
		});
	}
	startTyping(): void {
		if (!this.currentRoomId || !this.currentUserId || !this.currentUserName) {
			console.log("[chatService] startTyping: missing room/user info");
			return;
		}
		console.log("[chatService] Emitting typing_start", {
			roomId: this.currentRoomId,
			userId: this.currentUserId,
			userName: this.currentUserName,
		});
		socketService.emit("typing_start", {
			roomId: this.currentRoomId,
			userId: this.currentUserId,
			userName: this.currentUserName,
		});
		// Auto-stop typing after 3 seconds
		if (this.typingTimeout) {
			clearTimeout(this.typingTimeout);
		}
		this.typingTimeout = setTimeout(() => {
			console.log("[chatService] Auto stopTyping after timeout");
			this.stopTyping();
		}, 3000);
	}
	stopTyping(): void {
		if (!this.currentRoomId || !this.currentUserId || !this.currentUserName) {
			console.log("[chatService] stopTyping: missing room/user info");
			return;
		}
		console.log("[chatService] Emitting typing_stop", {
			roomId: this.currentRoomId,
			userId: this.currentUserId,
			userName: this.currentUserName,
		});
		socketService.emit("typing_stop", {
			roomId: this.currentRoomId,
			userId: this.currentUserId,
			userName: this.currentUserName,
		});
		if (this.typingTimeout) {
			clearTimeout(this.typingTimeout);
			this.typingTimeout = null;
		}
	}
	async getMessagesForRoom(
		roomId: string,
		limit: number = 50,
		offset: number = 0
	): Promise<ChatMessage[]> {
		return await chatDatabaseService.getMessagesForRoom(roomId, limit, offset);
	}
	async getAllRooms(): Promise<ChatRoom[]> {
		return await chatDatabaseService.getAllRooms();
	}
	private async handleNewMessage(message: ChatMessage): Promise<void> {
		// Save to local database
		await chatDatabaseService.saveMessage(message);

		// Notify UI
		this.notifyMessageListeners(message);
	}
	private async handleMessageDelivered(
		tempId: string,
		messageId: string
	): Promise<void> {
		// Update local database
		await chatDatabaseService.updateMessageDeliveryStatus(
			tempId,
			messageId,
			true
		);

		// Notify UI
		this.notifyDeliveryListeners(tempId, messageId);
	}
	private async handleRoomJoined(data: {
		roomId: string;
		messages: ChatMessage[];
		participants: ChatUser[];
	}): Promise<void> {
		// Save historical messages to local database
		for (const message of data.messages) {
			await chatDatabaseService.saveMessage(message);
		}
	}
	// Event listener management
	onMessage(callback: (message: ChatMessage) => void): () => void {
		this.messageListeners.push(callback);
		return () => {
			this.messageListeners = this.messageListeners.filter(
				(cb) => cb !== callback
			);
		};
	}
	onTyping(callback: (typingUser: TypingUser) => void): () => void {
		this.typingListeners.push(callback);
		return () => {
			this.typingListeners = this.typingListeners.filter(
				(cb) => cb !== callback
			);
		};
	}
	onDelivery(
		callback: (tempId: string, messageId: string) => void
	): () => void {
		this.deliveryListeners.push(callback);
		return () => {
			this.deliveryListeners = this.deliveryListeners.filter(
				(cb) => cb !== callback
			);
		};
	}
	private notifyMessageListeners(message: ChatMessage): void {
		this.messageListeners.forEach((callback) => callback(message));
	}
	private notifyTypingListeners(typingUser: TypingUser): void {
		this.typingListeners.forEach((callback) => callback(typingUser));
	}
	private notifyDeliveryListeners(tempId: string, messageId: string): void {
		this.deliveryListeners.forEach((callback) => callback(tempId, messageId));
	}
	public getCurrentRoomId(): string | null {
		return this.currentRoomId;
	}
}
export const chatService = new ChatService();
export type { ChatMessage, ChatRoom };
