
import yargs from "yargs";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { exec } from "child_process";
import util from "util";
const bcrypt = require('bcrypt');
import crypto from "crypto";
import { FileModel } from "./models/fileModel";
import { UserModel } from "./models/userModel";

require('dotenv').config({ path: path.join(__dirname, `/../../${process.env.NODE_ENV || "development"}.env`) });

const execPromise = util.promisify(exec);
const bcryptComparePromise = util.promisify(bcrypt.compare);
let killMongoose = false;

async function auth(username: string, password: string) {
    try {
        const user = await UserModel.findOne({ name: username });
        if (user == null) {
            // TODO: exit code

            await exit(1);
        }
        const verified = await bcryptComparePromise(password, user?.password);
        if (!verified)
            //TODO: exit code
            await exit(1);
    } catch (err) {
        //TODO: exit code
        await exit(1)
    }
}

function uploadFile(file: string): { filename: string, size: number, filepath: string } {
    let stat = fs.statSync(file);
    let newFilename = crypto.randomBytes(25).toString('hex') + path.extname(file);
    let newFilepath = path.join(__dirname, "/../Files/", newFilename);
    fs.renameSync(file, newFilepath);

    return {
        filename: file.replace(/^.*[\\\/]/, ''),
        size: stat.size,
        filepath: newFilepath
    };
}

async function exit(exitCode: number) {
    if (killMongoose) {
        await execPromise("taskkill /f /im mongod.exe");
    }

    process.exit(exitCode);
}

async function main() {

    const { stdout, stderr } = await execPromise('tasklist /FI "IMAGENAME eq mongod.exe');

    if (!stdout.includes("mongod")) {
        killMongoose = true;
        execPromise("start /b cmd /c mongod");
    }

    //mongoose
    try {
        mongoose.connect(process.env.DATABASE_CONNECTION_URI || "");
    }
    catch (err) {
        await exit(2); //TODO: exit code
    }

    yargs.option('files', {
        type: 'array'
    });

    const baseUrl = "http://localhost";
    const fileUploadUrl = baseUrl + "/files/upload";
    const authUrl = baseUrl + "/login";

    const argv: any = yargs.argv;

    const username = argv.user == "public" ? "Public" : process.env.CLI_USER;
    const password = username == "Public" ? "" : process.env.CLI_PASSWORD;

    if (username !== "Public") {
        if (username && password) {
            await auth(username, password);
        }
        else {
            await exit(1);
        }
    }

    const files = argv.files;
    if (!files || files.length == 0) {
        //TODO: exit code
        await exit(3)
    }
    let numFiles = files.length;
    let validFiles = 0;
    for (let file of files) {
        if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
            continue;
        }
        let { filename, size, filepath } = uploadFile(file);

        const newFile = new FileModel({
            name: filename,
            size: size,
            owner: username,
            fileLocation: filepath
        });

        try {
            const res = await newFile.save();
            validFiles++;

        } catch (err) {

        }
    }
    if (validFiles == numFiles) {
        await exit(0);
    }

    else {
        // add 3 to get an exit code of at least 4
        await exit(numFiles - validFiles + 3);
    }

}

main();