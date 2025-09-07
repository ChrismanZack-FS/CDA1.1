import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";
// Types for our data
export interface Task {
	id: number;
	title: string;
	description: string;
	completed: boolean;
	priority: "low" | "medium" | "high";
	createdAt: string;
	updatedAt: string;
}
class DatabaseService {
	private db: SQLite.SQLiteDatabase | null = null;
	async init(): Promise<void> {
		try {
			// Different database names for different platforms if needed
			const dbName = Platform.OS === "web" ? "tasks_web.db" : "tasks.db";

			this.db = await SQLite.openDatabaseAsync(dbName);
			await this.createTables();
			console.log("Database initialized successfully");
		} catch (error) {
			console.error("Error initializing database:", error);
			throw error;
		}
	}
	private async createTables(): Promise<void> {
		if (!this.db) throw new Error("Database not initialized");
		await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER DEFAULT 0,
        priority TEXT DEFAULT 'medium',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);
		// Create index for better query performance
		await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
    `);
	}
	async getAllTasks(): Promise<Task[]> {
		if (!this.db) throw new Error("Database not initialized");
		const result = await this.db.getAllAsync(`
      SELECT * FROM tasks ORDER BY createdAt DESC
    `);
		return result.map((row) => ({
			...row,
			completed: Boolean(row.completed),
		})) as Task[];
	}
	async getTaskById(id: number): Promise<Task | null> {
		if (!this.db) throw new Error("Database not initialized");
		const result = await this.db.getFirstAsync(
			`
      SELECT * FROM tasks WHERE id = ?
    `,
			[id]
		);
		if (!result) return null;
		return {
			...result,
			completed: Boolean(result.completed),
		} as Task;
	}
	async createTask(task: Omit<Task, "id">): Promise<Task> {
		if (!this.db) throw new Error("Database not initialized");
		const now = new Date().toISOString();
		const taskWithTimestamps = {
			...task,
			createdAt: now,
			updatedAt: now,
		};
		const result = await this.db.runAsync(
			`
      INSERT INTO tasks (title, description, completed, priority, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
			[
				taskWithTimestamps.title,
				taskWithTimestamps.description,
				taskWithTimestamps.completed ? 1 : 0,
				taskWithTimestamps.priority,
				taskWithTimestamps.createdAt,
				taskWithTimestamps.updatedAt,
			]
		);
		return {
			...taskWithTimestamps,
			id: result.lastInsertRowId,
		};
	}
	async updateTask(id: number, updates: Partial<Task>): Promise<Task | null> {
		if (!this.db) throw new Error("Database not initialized");
		const currentTask = await this.getTaskById(id);
		if (!currentTask) return null;
		const updatedTask = {
			...currentTask,
			...updates,
			updatedAt: new Date().toISOString(),
		};
		await this.db.runAsync(
			`
      UPDATE tasks 
      SET title = ?, description = ?, completed = ?, priority = ?, updatedAt = ?
      WHERE id = ?
    `,
			[
				updatedTask.title,
				updatedTask.description,
				updatedTask.completed ? 1 : 0,
				updatedTask.priority,
				updatedTask.updatedAt,
				id,
			]
		);
		return updatedTask;
	}
	async deleteTask(id: number): Promise<boolean> {
		if (!this.db) throw new Error("Database not initialized");
		const result = await this.db.runAsync(
			`
      DELETE FROM tasks WHERE id = ?
    `,
			[id]
		);
		return result.changes > 0;
	}
	async getTasksByPriority(priority: Task["priority"]): Promise<Task[]> {
		if (!this.db) throw new Error("Database not initialized");
		const result = await this.db.getAllAsync(
			`
      SELECT * FROM tasks WHERE priority = ? ORDER BY createdAt DESC
    `,
			[priority]
		);
		return result.map((row) => ({
			...row,
			completed: Boolean(row.completed),
		})) as Task[];
	}
	async getCompletedTasks(): Promise<Task[]> {
		if (!this.db) throw new Error("Database not initialized");
		const result = await this.db.getAllAsync(`
      SELECT * FROM tasks WHERE completed = 1 ORDER BY updatedAt DESC
    `);
		return result.map((row) => ({
			...row,
			completed: Boolean(row.completed),
		})) as Task[];
	}
	async clearAllTasks(): Promise<void> {
		if (!this.db) throw new Error("Database not initialized");
		await this.db.runAsync("DELETE FROM tasks");
	}
}
export default new DatabaseService();
