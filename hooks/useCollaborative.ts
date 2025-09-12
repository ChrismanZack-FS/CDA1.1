import { useState, useEffect, useCallback } from "react";
import {
	collaborativeService,
	CollaborativeState,
	Participant,
	EditLock,
} from "../services/collaborativeService";
export interface UseCollaborativeReturn {
	sharedState: CollaborativeState;
	participants: Participant[];
	editLocks: EditLock[];
	isConnected: boolean;
	updateTask: (taskId: string, updates: any) => Promise<void>;
	addTask: (taskId: string, task: any) => Promise<void>;
	deleteTask: (taskId: string) => Promise<void>;
	requestEditLock: (field: string) => Promise<boolean>;
	releaseEditLock: (field: string) => Promise<void>;
	updatePresence: (presence: any) => void;
	setUserActivity: (isActive: boolean) => void;
}
export const useCollaborative = (
	userId: string,
	roomId: string
): UseCollaborativeReturn => {
	const [sharedState, setSharedState] = useState<CollaborativeState>({
		tasks: {},
	});
	const [participants, setParticipants] = useState<Participant[]>([]);
	const [editLocks, setEditLocks] = useState<EditLock[]>([]);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		let unsubscribeState = () => {};
		let unsubscribeParticipants = () => {};
		let unsubscribeLocks = () => {};
		let unsubscribePresence = () => {};
		let socketService: any;
		let handleConnect: any;
		let handleDisconnect: any;

		const initializeCollaboration = async () => {
			try {
				await collaborativeService.initialize(userId, roomId);

				// Set up event listeners
				unsubscribeState = collaborativeService.onStateChange((state) => {
					setSharedState({ ...state }); // Force new object reference
				});
				unsubscribeParticipants = collaborativeService.onParticipantsChange(
					(participants) => {
						setParticipants(participants);
					}
				);
				unsubscribeLocks = collaborativeService.onLocksChange((locks) => {
					setEditLocks(locks);
				});
				unsubscribePresence = collaborativeService.onPresenceChange(
					(userId, presence) => {
						setParticipants((prev) =>
							prev.map((p) => (p.userId === userId ? { ...p, ...presence } : p))
						);
					}
				);
				// Track connection status
				socketService = require("../services/socketService").socketService;
				handleConnect = () => setIsConnected(true);
				handleDisconnect = () => setIsConnected(false);

				socketService.on("connect", handleConnect);
				socketService.on("disconnect", handleDisconnect);
				setIsConnected(socketService.isConnected());
			} catch (error) {
				console.error("Error initializing collaboration:", error);
			}
		};
		initializeCollaboration();
		return () => {
			unsubscribeState();
			unsubscribeParticipants();
			unsubscribeLocks();
			unsubscribePresence();
			if (socketService) {
				socketService.off("connect", handleConnect);
				socketService.off("disconnect", handleDisconnect);
			}
		};
	}, [userId, roomId]);
	const updateTask = useCallback(async (taskId: string, updates: any) => {
		await collaborativeService.updateTask(taskId, updates);
	}, []);
	const addTask = useCallback(async (taskId: string, task: any) => {
		await collaborativeService.addTask(taskId, task);
	}, []);
	const deleteTask = useCallback(async (taskId: string) => {
		await collaborativeService.deleteTask(taskId);
	}, []);
	const requestEditLock = useCallback(async (field: string) => {
		return await collaborativeService.requestEditLock(field);
	}, []);
	const releaseEditLock = useCallback(async (field: string) => {
		await collaborativeService.releaseEditLock(field);
	}, []);
	const updatePresence = useCallback((presence: any) => {
		collaborativeService.updatePresence(presence);
	}, []);
	const setUserActivity = useCallback((isActive: boolean) => {
		collaborativeService.setUserActivity(isActive);
	}, []);
	return {
		sharedState,
		participants,
		editLocks,
		isConnected,
		updateTask,
		addTask,
		deleteTask,
		requestEditLock,
		releaseEditLock,
		updatePresence,
		setUserActivity,
	};
};
