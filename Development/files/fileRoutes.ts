import express from "express";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { auth } from "../config/auth";
import { socketIo } from "../socket/socketIoConfig";
import util from "../utils/util";
import { FileResponse } from "./file";
import { FileService } from "./fileService";

const router = express.Router();

router.get("/", auth.setCurrentUser, async (req: any, res) => {
	const currentUser = req.user.username;
	const requestedFilesOfUser = req.query.username;
	if (
		requestedFilesOfUser === "Public" ||
		currentUser === requestedFilesOfUser
	) {
		const files: FileResponse[] | undefined =
			FileService.getFilesByUsername(requestedFilesOfUser);
		if (!files) {
			res.sendStatus(500);
		}
		res.json(files);
		return;
	}
	res.sendStatus(403);
});

router.get("/download", auth.setCurrentUser, async (req: any, res) => {
	const username: string = req.user.username;
	const fileId: string = req.query.id;

	if (!fileId) {
		res.sendStatus(404);
		return;
	}
	const file = FileService.getFileByIdAndUser(fileId, username);

	if (!file || !fs.existsSync(file.fileLocation)) {
		res.sendStatus(404);
		return;
	}
	res.download(file.fileLocation, file.name, (err) => {
		if (err) {
			console.error(`An error occured downloading the file ${file.name}`);
		} else
			console.log(`The file ${file.name} has been downloaded successfully`);
	});
	return;
});

router.delete("/delete", auth.setCurrentUser, async (req: any, res) => {
	let fileId: string = req.query.fileId.trim();
	const username: string = req.user.username ?? "Public";
	if (username !== "Public" && username !== req.user.username) {
		res.sendStatus(403);
		return;
	}
	if (!fileId) {
		res.sendStatus(404);
		return;
	}
	const file = FileService.deleteFileById(fileId, username);
	if (!file) {
		res.sendStatus(404);
		return;
	}
	util.deleteFile(file.fileLocation);
	socketIo.sendDeleteFile(file.id, username);
	res.sendStatus(200);
});

router.delete("/deleteAll", auth.setCurrentUser, async (req: any, res) => {
	const currentUser = req.user.username;
	const requestedFilesOfUser = req.query.username;

	if (
		requestedFilesOfUser === "Public" ||
		currentUser === requestedFilesOfUser
	) {
		const files = FileService.deleteFilesByUser(requestedFilesOfUser);
		if (!files) {
			res.sendStatus(404);
			return;
		}
		let filePaths: string[] = files.map((file: { fileLocation: any }) => {
			return file.fileLocation;
		});
		util.deleteMultipleFiles(filePaths);
		socketIo.sendDeleteAll(requestedFilesOfUser);
		res.sendStatus(200);
		return;
	}

	res.sendStatus(404);
});

router.post("/upload", auth.setCurrentUser, async (req: any, res) => {
	// store files
	let files = Array<any>();
	// set file owner
	let targetUser = "";
	// set file max file size to 10000 MB
	const maxFileSize = 10000 * 1024 * 1024;
	// create an incoming form object
	var form = formidable({
		multiples: true,
		uploadDir: path.join(__dirname, "/../../Files"),
		keepExtensions: true,
		maxFileSize: maxFileSize,
		allowEmptyFiles: true,
		minFileSize: 0,
	});

	// every time a file has been uploaded successfully
	form.on("file", async (_, file) => {
		files.push(file);
	});

	form.on("fileBegin", (field, value) => {
		const currentUser = req.user.username;
		if (targetUser !== "Public" && currentUser !== targetUser) {
			throw new formidable.errors.FormidableError("unautherized", 0, 401);
		}
	});

	form.on("field", (field, value) => {
		if (field === "username") {
			targetUser = value;
		}
	});
	// log any errors that occur
	form.once("error", function (err) {
		console.error(err);
		res.sendStatus(400);
		return;
	});
	// once all the files have been uploaded, send a response to the client
	form.once("end", function () {
		const currentUser = req.user.username;
		if (targetUser === "Public" || currentUser === targetUser) {
			for (let file of files) {
				const newFile = FileService.createFile({
					name: file.originalFilename,
					size: file.size,
					owner: targetUser,
					fileLocation: file.filepath,
				});
				if (!newFile) {
					res.sendStatus(400);
					return;
				}
				socketIo.sendNewFile(newFile, targetUser);
			}
			res.end();
		} else {
			res.sendStatus(400);
		}
	});
	// parse the incoming request containing the form data
	form.parse(req, () => {});
});

export { router };
