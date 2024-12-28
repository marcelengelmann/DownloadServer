import session from "express-session";
import { db } from "../database/sqliteDatabase";
const SqliteSessionStore = require("better-sqlite3-session-store")(session);

const SqliteStore = new SqliteSessionStore({
	client: db,
	expired: {
		clear: true,
		intervalMs: 900000, //ms = 15min
	},
});

export { SqliteStore };
