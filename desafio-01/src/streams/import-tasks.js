import fs from "fs";
import { parse } from "csv-parse";
import fetch from "node-fetch";

const filePath = "../../tasks.csv";

const importTasks = async () => {
	const parser = fs.createReadStream(filePath).pipe(parse({ columns: true, delimiter: "," }));

	for await (const record of parser) {
		const { title, description } = record;

		if (title && description) {
			await fetch("http://localhost:3335/tasks", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ title, description }),
			});
		}
	}

	console.log("Importação de tarefas concluída.");
};

importTasks().catch((error) => console.error("Erro ao importar tarefas:", error));
