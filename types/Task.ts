export interface Task {
	id: string;
	title: string;
	description: string;
	priority: "High" | "Medium" | "Low";
	completed: boolean;
	createdAt: Date;
}
