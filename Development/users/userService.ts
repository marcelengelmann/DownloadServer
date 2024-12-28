import { db } from "../database/sqliteDatabase";
import { CreateUserRequest, User } from "./user";

db.exec(`CREATE TABLE IF NOT EXISTS "users" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"username" TEXT CHECK(length(username) > 3 AND length(username) < 20) NOT NULL UNIQUE,
	"password" TEXT CHECK(length(password) > 5) NOT NULL,
	"role" TEXT CHECK(role IN ('User', 'Admin')) NOT NULL DEFAULT 'User',
	"creationDate" DATETIME DEFAULT CURRENT_TIMESTAMP,
	"salt" TEXT
)`);

const SqlStatements = {
	selectUserByName: db.prepare(
		"SELECT * FROM users WHERE username = @username"
	),
	selectUserById: db.prepare("SELECT * FROM users WHERE id = @id"),
	createUser: db.prepare(
		"INSERT INTO users (username, password, role) VALUES (@username, @password, @role)"
	),
};

class UserService {
	public getUserByName(username: string): User | undefined {
		try {
			return SqlStatements.selectUserByName.get({ username: username }) as
				| User
				| undefined;
		} catch (err) {
			console.error(err);
			return undefined;
		}
	}

	public getUserById(id: number): User | undefined {
		try {
			return SqlStatements.selectUserById.get({ id: id }) as User | undefined;
		} catch (err) {
			console.error(err);
			return undefined;
		}
	}

	public createUser(createUser: CreateUserRequest): User | undefined {
		try {
			SqlStatements.createUser.run(createUser);
			return this.getUserByName(createUser.username);
		} catch (err) {
			console.error(err);
			return undefined;
		}
	}
}

const userService = new UserService();

export { userService as UserService };
