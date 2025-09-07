// context/TasksContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import databaseService, { Task } from "../services/database";

interface TasksContextType {
	tasks: Task[];
	loading: boolean;
	error: string | null;
	createTask: (taskData: Omit<Task, "id">) => Promise<Task>;
	updateTask: (id: number, updates: Partial<Task>) => Promise<Task | null>;
	deleteTask: (id: number) => Promise<boolean>;
	refreshTasks: () => Promise<void>;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Load tasks from DB
	const loadTasks = async () => {
		try {
			setLoading(true);
			setError(null);
			const allTasks = await databaseService.getAllTasks();
			setTasks(allTasks);
		} catch (err: any) {
			setError(err.message || "Failed to load tasks");
		} finally {
			setLoading(false);
		}
	};

	const createTask = async (taskData: Omit<Task, "id">) => {
		const newTask = await databaseService.createTask(taskData);
		setTasks((prev) => [newTask, ...prev]);
		return newTask;
	};

	const updateTask = async (id: number, updates: Partial<Task>) => {
		const updatedTask = await databaseService.updateTask(id, updates);
		if (updatedTask) {
			setTasks((prev) =>
				prev.map((t) => (Number(t.id) === Number(id) ? updatedTask : t))
			);
		}
		return updatedTask;
	};

	const deleteTask = async (id: number) => {
		const success = await databaseService.deleteTask(id);

		setTasks((prev) => prev.filter((t) => Number(t.id) !== Number(id)));
		return success;
	};

	useEffect(() => {
		loadTasks();
	}, []);

	return (
		<TasksContext.Provider
			value={{
				tasks,
				loading,
				error,
				createTask,
				updateTask,
				deleteTask,
				refreshTasks: loadTasks,
			}}
		>
			{children}
		</TasksContext.Provider>
	);
};

// Hook to use context
export const useTasksContext = () => {
	const context = useContext(TasksContext);
	if (!context)
		throw new Error("useTasksContext must be used within TasksProvider");
	return context;
};
