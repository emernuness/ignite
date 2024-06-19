import { randomUUID } from "node:crypto";
import { buildRoutePath } from "./utils/route-path.js";
import { Database } from "./middlewares/database.js";
import fs from "fs";
import { parse } from "csv-parse";

const database = new Database();

export const routes = [
	{
		method: "GET",
		path: buildRoutePath("/tasks"),
		handler: (req, res) => {
			const { search } = req.query;

			const tasks = database.select(
				"tasks",
				search
					? {
							title: search,
							description: search,
					  }
					: null
			);
			return res.end(JSON.stringify(tasks));
		},
	},
	{
		method: "POST",
		path: buildRoutePath("/tasks"),
		handler: (req, res) => {
			const { title, description } = req.body;

			if (!title || !description) {
				return res.writeHead(400).end("Title and description are required");
			}

			const tasks = {
				id: randomUUID(),
				title,
				description,
				completed_at: null,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			};
			console.log(tasks);
			database.insert("tasks", tasks);
			return res.writeHead(201).end();
		},
	},
	{
		method: "DELETE",
		path: buildRoutePath("/tasks/:id"),
		handler: (req, res) => {
			const { id } = req.params;
			const task = database.select("tasks", { id })[0];

			if (!task) {
				return res.writeHead(404).end("Task not found");
			}

			database.delete("tasks", id);
			return res.writeHead(204).end();
		},
	},
	{
		method: "PUT",
		path: buildRoutePath("/tasks/:id"),
		handler: (req, res) => {
			const { id } = req.params;
			const { title, description } = req.body;

			if (!title || !description) {
				return res.writeHead(400).end("Title and description are required");
			}

			const task = database.select("tasks", { id })[0];

			if (!task) {
				return res.writeHead(404).end("Task not found");
			}

			const updatedTask = {
				...task,
				title,
				description,
				updated_at: new Date().toISOString(),
			};
			database.update("tasks", id, updatedTask);

			return res.writeHead(204).end();
		},
	},
	{
		method: "PATCH",
		path: buildRoutePath("/tasks/:id/complete"),
		handler: (req, res) => {
			const { id } = req.params;
			const task = database.select("tasks", { id })[0];

			if (!task) {
				return res.writeHead(404).end("Task not found");
			}

			const updatedTask = {
				...task,
				completed_at: task.completed_at === null ? true : !task.completed_at,
				updated_at: new Date().toISOString(),
			};

			database.update("tasks", id, updatedTask);

			return res.writeHead(204).end();
		},
	},
	{
		method: "POST",
		path: buildRoutePath("/tasks/import"),
		handler: async (req, res) => {
			const parser = req.pipe(parse({ columns: true, delimiter: "," }));
			for await (const record of parser) {
				const { title, description } = record;

				if (title && description) {
					const task = {
						id: randomUUID(),
						title,
						description,
						completed_at: null,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
					};
					database.insert("tasks", task);
				}
			}
			return res.writeHead(201).end();
		},
	},
];
