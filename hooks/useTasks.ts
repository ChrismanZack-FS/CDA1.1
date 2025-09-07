import { useEffect, useState } from "react";
import databaseService, { Task } from "../services/database";
export function useTasks() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const loadTasks = async () => {
		try {
			setLoading(true);
			setError(null);
			const allTasks = await databaseService.getAllTasks();
			setTasks(allTasks);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load tasks");
		} finally {
			setLoading(false);
		}
	};
	const createTask = async (taskData: Omit<Task, "id">) => {
		try {
			const newTask = await databaseService.createTask(taskData);
			setTasks((prev) => [newTask, ...prev]);
			return newTask;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create task");
			throw err;
		}
	};
	const updateTask = async (id: number, updates: Partial<Task>) => {
		try {
			const updatedTask = await databaseService.updateTask(id, updates);
			if (updatedTask) {
				setTasks((prev) =>
					prev.map((task) => (task.id === id ? updatedTask : task))
				);
			}
			return updatedTask;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to update task");
			throw err;
		}
	};
	const deleteTask = async (id: number) => {
		try {
			const success = await databaseService.deleteTask(id);
			if (success) {
				setTasks((prev) => prev.filter((task) => task.id !== id));
			}
			return success;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to delete task");
			throw err;
		}
	};
	useEffect(() => {
		loadTasks();
	}, []);
	return {
		tasks,
		loading,
		error,
		createTask,
		updateTask,
		deleteTask,
		refreshTasks: loadTasks,
	};
}
