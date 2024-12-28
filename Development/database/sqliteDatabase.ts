import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(__dirname, "../../", ".databaseData/");

if (!fs.existsSync(DB_PATH)) {
	fs.mkdirSync(DB_PATH);
}

const db = new Database(path.join(DB_PATH, "DownloadServer.db"));
db.pragma("journal_mode = WAL");

export { db };
