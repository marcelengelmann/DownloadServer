
// TODO:

// schieb projekt in server ordnern
// nutze die lokale speicher methode in der files route
// schaue ob mongodb läuft, sonst starte es und beende es am Ende wieder(nur wenn es am anfang nicht lief)
// connecte zur db etc.


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

require('dotenv').config();
const execPromise = util.promisify(exec);
let killMongoose = false;

async function auth(username: string, password: string) {
    try {
        const user = await UserModel.findOne({ name: username });
        if (!user) {
            // TODO: exit code
            await exit(1);
        }
        const { err, isMatch } = await bcrypt.compare(password, user?.password);
        if (err || !isMatch)
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
    fs.copyFileSync(file, newFilepath);
    // TODO: use move instead of copy
    // fs.renameSync(file, newFilepath);

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
        mongoose.connect('mongodb://localhost/DownloadServer');
    }
    catch (err) {
        await exit(1); //TODO: exit code
    }

    yargs.option('files', {
        type: 'array'
    });

    const baseUrl = "http://localhost";
    const fileUploadUrl = baseUrl + "/files/upload";
    const authUrl = baseUrl + "/login";

    const argv: any = yargs.argv;

    const username = argv.user == "public" ? "Public" : process.env.USER;
    const password = username == "Public" ? "" : process.env.PASSWORD;

    if (username !== "Public") {
        if (username && password) {
            auth(username, password);
        }
        else {
            exit(1);
        }
    }

    const files = argv.files;
    if (!files || files.length == 0) {
        //TODO: exit code
        await exit(1)
    }

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
        console.log("hi");

        try {
            const res = await newFile.save();
            console.log(res);

        } catch (err) {
            //TODO: error code
            exit(1);
        }
    }

}

main();