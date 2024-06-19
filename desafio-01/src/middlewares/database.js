import fs from "node:fs/promises";

const databasepath = new URL("../../db.json", import.meta.url);

export class Database {
	#database = {}; // Adicionar o # antes do nome da propriedade para torná-la privada

	constructor() {
		fs
			.readFile(databasepath, "utf-8")
			.then((data) => {
				this.#database = JSON.parse(data);
			})
			.catch(() => {
				this.#persist();
			});
	}

	#persist() {
		fs.writeFile(databasepath, JSON.stringify(this.#database));
	}

	select(table, search) {
		let data = this.#database[table] ?? [];

		if (search) {
			data = data.filter((row) => {
				return Object.entries(search).some(([key, value]) => {
					return row[key].toLowerCase().includes(value.toLowerCase());
				});
			});
		}
		return data;
	}

	insert(table, data) {
		if (Array.isArray(this.#database[table])) {
			this.#database[table].push(data);
		} else {
			this.#database[table] = [data];
		}
		this.#persist();
		return data;
	}

	delete(table, id) {
		const rowIndex = this.#database[table].findIndex((row) => row.id === id);

		if (rowIndex > -1) {
			this.#database[table].splice(rowIndex, 1);
			this.#persist();
		}
	}

	update(table, id, data) {
		const rowIndex = this.#database[table].findIndex((row) => row.id === id);

		if (rowIndex > -1) {
			this.#database[table][rowIndex] = { id, ...data };
			this.#persist();
		}
	}
}
