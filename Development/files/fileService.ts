import { db } from "../database/sqliteDatabase";
import { CreateFileRequest, FileResponse, UserFile } from "./file";

db.exec(`CREATE TABLE IF NOT EXISTS "files" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"name" TEXT CHECK(length(name) > 0) NOT NULL,
	"size" INTEGER NOT NULL,
	"owner" TEXT NOT NULL default "Public",
	"uploadDate" DATETIME DEFAULT CURRENT_TIMESTAMP,
	"fileLocation" TEXT NOT NULL
)`);

const SqlStatements = {
	selectFilesByOwner: db.prepare(
		"SELECT id, name, size, uploadDate FROM files WHERE owner = @owner"
	),
	selectFileByIdAndUsers: db.prepare(
		"SELECT * FROM files WHERE id = @id AND owner IN ('Public', @owner)"
	),
	selectAndDeleteFileByIdAndOwner: db.prepare(
		"DELETE FROM files WHERE id = @id AND owner IN ('Public', @owner) returning *"
	),
	selectAndDeleteFilesByUsername: db.prepare(
		"DELETE FROM files WHERE owner = @owner returning *"
	),
	createFile: db.prepare(
		"INSERT INTO files (name, size, owner, fileLocation) VALUES (@name, @size, @owner, @fileLocation) returning id, name, size, uploadDate"
	),
};

class FileService {
	public getFilesByUsername(username: string): FileResponse[] | undefined {
		try {
			return SqlStatements.selectFilesByOwner.all({ owner: username }) as
				| FileResponse[]
				| undefined;
		} catch (err) {
			console.error(err);
			return undefined;
		}
	}

	public getFileByIdAndUser(id: string, owner: string): UserFile | undefined {
		try {
			return SqlStatements.selectFileByIdAndUsers.get({
				id: id,
				owner: owner,
			}) as UserFile | undefined;
		} catch (err) {
			console.error(err);
			return undefined;
		}
	}

	public createFile(
		createFileRquest: CreateFileRequest
	): FileResponse | undefined {
		try {
			return SqlStatements.createFile.get(createFileRquest) as
				| UserFile
				| undefined;
		} catch (err) {
			console.error(err);
			return undefined;
		}
	}

	public deleteFileById(id: string, owner: string): UserFile | undefined {
		try {
			return SqlStatements.selectAndDeleteFileByIdAndOwner.get({
				id: id,
				owner: owner,
			}) as UserFile | undefined;
		} catch (err) {
			console.error(err);
			return undefined;
		}
	}

	public deleteFilesByUser(username: string): UserFile[] | undefined {
		try {
			return SqlStatements.selectAndDeleteFilesByUsername.all({
				owner: username,
			}) as UserFile[] | undefined;
		} catch (err) {
			console.error(err);
			return undefined;
		}
	}
}

const fileService = new FileService();

export { fileService as FileService };
