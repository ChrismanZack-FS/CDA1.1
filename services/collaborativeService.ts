import { socketService } from "./socketService";
import { connectionManager } from "./connectionManager";

// Collaborative operation types
export type CollaborativeOperation = {
	type: "ADD_TASK" | "UPDATE_TASK" | "DELETE_TASK";
	taskId?: string;
	task?: any;
	updates?: any;
	userId: string;
	clientId?: string;
};

// Local state structure
interface CollaborativeLocalState {
	tasks: {
		[taskId: string]: {
			id: string;
			title: string;
			completed: boolean;
			createdBy?: string;
			createdAt?: string;
			deleted?: boolean;
			syncStatus?: "pending" | "synced" | "failed";
			[key: string]: any;
		};
	};
}

export interface Participant {
	userId: string;
	userName: string;
	isActive: boolean;
	cursor?: { x: number; y: number };
	selection?: { start: number; end: number };
	lastActivity: string;
}
export interface EditLock {
	field: string;
	userId: string;
	userName: string;
}
export interface CollaborativeState {
	tasks: { [taskId: string]: any };
	[key: string]: any;
}
class CollaborativeService {
	public currentUserId?: string;
	public currentRoomId?: string;
	public localState: CollaborativeLocalState = { tasks: {} };
	private stateListeners: ((state: CollaborativeLocalState) => void)[] = [];
	private pendingOperations: Map<string, CollaborativeOperation> = new Map();
	private isConnected: boolean = false;
	// Event listeners
	private participantListeners: ((participants: Participant[]) => void)[] = [];
	private lockListeners: ((locks: EditLock[]) => void)[] = [];
	private presenceListeners: ((userId: string, presence: any) => void)[] = [];
	async initialize(userId: string, roomId: string): Promise<void> {
		this.currentUserId = userId;
		this.currentRoomId = roomId;

		this.setupSocketListeners();

		// Join collaborative room
		socketService.emit("join_collaborative_room", {
			roomId,
			userId,
			userName: "User " + userId, // You'd get this from user profile
		});
	}
	private setupSocketListeners(): void {
		// Handle initial state sync
		socketService.on(
			"collaborative_state_sync",
			(data: {
				roomId: string;
				sharedState: CollaborativeState;
				operationHistory: CollaborativeOperation[];
				participants: Participant[];
				activeEditors: { [field: string]: EditLock };
			}) => {
				this.localState = { ...data.sharedState };
				this.isConnected = true;

				// Apply any pending operations
				this.flushPendingOperations();

				// Notify listeners
				this.notifyStateListeners();
				this.notifyParticipantListeners(data.participants);
				this.notifyLockListeners(Object.values(data.activeEditors));
			}
		);
		// Handle operations from other users
		socketService.on(
			"operation_applied",
			(data: {
				operation: CollaborativeOperation;
				sharedState: CollaborativeState;
			}) => {
				// Debug log for real-time sync
				console.log(
					"[collaborativeService] operation_applied received:",
					data.operation.type,
					data.operation.taskId
				);
				// Always update local state for real-time sync
				this.localState = { ...data.sharedState };
				this.notifyStateListeners();
				console.log(
					"[collaborativeService] localState updated from operation_applied:",
					Object.keys(this.localState.tasks)
				);
			}
		);
		// Handle participant updates
		socketService.on(
			"participants_updated",
			(data: { participants: Participant[] }) => {
				this.notifyParticipantListeners(data.participants);
			}
		);
		// Handle field locking
		socketService.on("field_locked", (data: EditLock) => {
			// Update UI to show field is being edited
			this.notifyLockListeners([data]);
		});
		socketService.on(
			"field_unlocked",
			(data: { field: string; userId: string }) => {
				// Update UI to show field is available
				this.notifyLockListeners([]);
			}
		);
		// Handle presence updates
		socketService.on(
			"presence_updated",
			(data: { userId: string; presenceData: any; timestamp: string }) => {
				this.notifyPresenceListeners(data.userId, data.presenceData);
			}
		);
		// Handle connection state
		socketService.on("connect", () => {
			this.isConnected = true;
			this.flushPendingOperations();
		});
		socketService.on("disconnect", () => {
			this.isConnected = false;
		});
	}
	// Public API for making collaborative changes
	async updateTask(taskId: string, updates: any): Promise<void> {
		const operation: CollaborativeOperation = {
			type: "UPDATE_TASK",
			taskId,
			updates,
			userId: this.currentUserId!,
			clientId: this.generateClientId(),
		};
		// Apply optimistically to local state
		this.applyOperationLocally(operation);

		// Send to server or queue if offline
		if (this.isConnected) {
			socketService.emit("collaborative_operation", {
				roomId: this.currentRoomId,
				operation,
			});
		} else {
			this.pendingOperations.set(operation.clientId!, operation);
		}
	}
	async addTask(taskId: string, task: any): Promise<void> {
		const operation: CollaborativeOperation = {
			type: "ADD_TASK",
			taskId,
			task: {
				...task,
				createdBy: this.currentUserId,
				createdAt: new Date().toISOString(),
			},
			userId: this.currentUserId!,
			clientId: this.generateClientId(),
		};
		this.applyOperationLocally(operation);

		if (this.isConnected) {
			socketService.emit("collaborative_operation", {
				roomId: this.currentRoomId,
				operation,
			});
		} else {
			this.pendingOperations.set(operation.clientId!, operation);
		}
	}
	async deleteTask(taskId: string): Promise<void> {
		const operation: CollaborativeOperation = {
			type: "DELETE_TASK",
			taskId,
			userId: this.currentUserId!,
			clientId: this.generateClientId(),
		};
		this.applyOperationLocally(operation);

		if (this.isConnected) {
			socketService.emit("collaborative_operation", {
				roomId: this.currentRoomId,
				operation,
			});
		} else {
			this.pendingOperations.set(operation.clientId!, operation);
		}
	}
	// Edit locking for preventing conflicts
	async requestEditLock(field: string): Promise<boolean> {
		return new Promise((resolve) => {
			socketService.emit("request_edit_lock", {
				roomId: this.currentRoomId,
				field,
				userId: this.currentUserId,
			});
			// Listen for response
			const handleResponse = (data: {
				success: boolean;
				field: string;
				currentEditor?: string;
			}) => {
				if (data.field === field) {
					socketService.off("edit_lock_response", handleResponse);
					resolve(data.success);
				}
			};
			socketService.on("edit_lock_response", handleResponse);
		});
	}
	async releaseEditLock(field: string): Promise<void> {
		socketService.emit("release_edit_lock", {
			roomId: this.currentRoomId,
			field,
			userId: this.currentUserId,
		});
	}
	// Presence management
	updatePresence(presenceData: {
		cursor?: { x: number; y: number };
		selection?: any;
	}): void {
		socketService.emit("update_presence", {
			roomId: this.currentRoomId,
			userId: this.currentUserId,
			presenceData,
		});
	}
	setUserActivity(isActive: boolean): void {
		socketService.emit("user_activity_change", {
			roomId: this.currentRoomId,
			userId: this.currentUserId,
			isActive,
		});
	}
	// State management
	getState(): CollaborativeState {
		return this.localState;
	}
	// Utility: Generate unique clientId for operations
	private generateClientId(): string {
		return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
	// Apply operation to local state
	private applyOperationLocally(operation: CollaborativeOperation): void {
		// Ensure localState and tasks are initialized
		if (!this.localState) {
			this.localState = { tasks: {} };
		}
		if (!this.localState.tasks) {
			this.localState.tasks = {};
		}
		if (operation.type === "ADD_TASK" && operation.taskId && operation.task) {
			this.localState.tasks[operation.taskId] = { ...operation.task };
		} else if (
			operation.type === "UPDATE_TASK" &&
			operation.taskId &&
			operation.updates
		) {
			if (this.localState.tasks[operation.taskId]) {
				Object.assign(
					this.localState.tasks[operation.taskId],
					operation.updates
				);
			}
		} else if (operation.type === "DELETE_TASK" && operation.taskId) {
			if (this.localState.tasks[operation.taskId]) {
				delete this.localState.tasks[operation.taskId];
			}
		}
		this.notifyStateListeners();
	}
	// Notify listeners of state change
	private notifyStateListeners(): void {
		console.log(
			"[collaborativeService] notifyStateListeners called. Current tasks:",
			Object.keys(this.localState.tasks)
		);
		this.stateListeners.forEach((callback) => callback(this.localState));
	}
	// Notify participant listeners
	private notifyParticipantListeners(participants: any[]): void {
		this.participantListeners.forEach((cb) => cb(participants));
	}
	// Notify lock listeners
	private notifyLockListeners(locks: any[]): void {
		this.lockListeners.forEach((cb) => cb(locks));
	}
	// Notify presence listeners
	private notifyPresenceListeners(userId: string, presenceData: any): void {
		this.presenceListeners.forEach((cb) => cb(userId, presenceData));
	}
	// Listener registration
	public onStateChange(
		callback: (state: CollaborativeLocalState) => void
	): () => void {
		this.stateListeners.push(callback);
		return () => {
			this.stateListeners = this.stateListeners.filter((cb) => cb !== callback);
		};
	}
	// Listener registration (optional, for completeness)
	public onParticipantsChange(cb: (participants: any[]) => void): () => void {
		this.participantListeners.push(cb);
		return () => {
			this.participantListeners = this.participantListeners.filter(
				(x) => x !== cb
			);
		};
	}
	public onLocksChange(cb: (locks: any[]) => void): () => void {
		this.lockListeners.push(cb);
		return () => {
			this.lockListeners = this.lockListeners.filter((x) => x !== cb);
		};
	}
	public onPresenceChange(
		cb: (userId: string, presenceData: any) => void
	): () => void {
		this.presenceListeners.push(cb);
		return () => {
			this.presenceListeners = this.presenceListeners.filter((x) => x !== cb);
		};
	}
	// Flush pending operations (stub)
	private flushPendingOperations(): void {
		// Example: send all pending operations to server if connected
		if (connectionManager.isConnected()) {
			this.pendingOperations.forEach((op, clientId) => {
				this.sendOperation(op);
			});
			this.pendingOperations.clear();
		}
	}
	// Fix pendingOperations usage in methods
	private sendOperation(operation: CollaborativeOperation): void {
		socketService.emit("collaborative_operation", {
			roomId: this.currentRoomId,
			operation,
		});
		this.pendingOperations.set(operation.clientId!, operation);
	}
	private queueOperation(operation: CollaborativeOperation): void {
		connectionManager.queueOperation({
			type: "collaborative_operation",
			data: {
				roomId: this.currentRoomId,
				operation,
			},
		});
	}
}

export const collaborativeService = new CollaborativeService();
