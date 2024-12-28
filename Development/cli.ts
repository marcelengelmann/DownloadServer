import crypto from "crypto";
import fs from "fs";
import path from "path";
import util from "util";
import yargs from "yargs";
import { FileService } from "./files/fileService";
import { UserService } from "./users/userService";
const bcrypt = require("bcrypt");

require("dotenv").config({
	path: path.join(
		__dirname,
		`/../../${process.env.NODE_ENV || "development"}.env`
	),
});

const bcryptComparePromise = util.promisify(bcrypt.compare);

async function auth(username: string, password: string) {
	try {
		const user = UserService.getUserByName(username);

		if (user == null) {
			// TODO: exit code
			exit(1);
		}
		const verified = await bcryptComparePromise(password, user?.password);
		if (!verified)
			//TODO: exit code
			exit(1);
	} catch (err) {
		//TODO: exit code
		exit(1);
	}
}

function uploadFile(file: string): {
	filename: string;
	size: number;
	filepath: string;
} {
	let stat = fs.statSync(file);
	let newFilename = crypto.randomBytes(25).toString("hex") + path.extname(file);
	let newFilepath = path.join(__dirname, "/../Files/", newFilename);
	fs.renameSync(file, newFilepath);

	return {
		filename: file.replace(/^.*[\\\/]/, ""),
		size: stat.size,
		filepath: newFilepath,
	};
}

function exit(exitCode: number) {
	process.exit(exitCode);
}

async function main() {
	yargs.option("files", {
		type: "array",
	});

	const argv: any = yargs.argv;

	const username = argv.user == "public" ? "Public" : process.env.CLI_USER!;
	const password = username == "Public" ? "" : process.env.CLI_PASSWORD;

	if (username !== "Public") {
		if (username && password) {
			await auth(username, password);
		} else {
			exit(1);
		}
	}

	const files = argv.files;
	if (!files || files.length == 0) {
		//TODO: exit code
		exit(3);
	}
	let numFiles = files.length;
	let validFiles = 0;
	for (let file of files) {
		if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
			continue;
		}
		let { filename, size, filepath } = uploadFile(file);

		const newFile = FileService.createFile({
			name: filename,
			size: size,
			owner: username,
			fileLocation: filepath,
		});

		if (!newFile) {
			continue;
		}
		validFiles++;
	}
	if (validFiles == numFiles) {
		exit(0);
	} else {
		// add 3 to get an exit code of at least 4
		exit(numFiles - validFiles + 3);
	}
}

main();
