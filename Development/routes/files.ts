import express from 'express';
import fs from "fs";
import path from "path";
import mongoose from "mongoose"
import formidable from "formidable";
import { auth } from "../config/auth";
import util from '../utils/util';
import { FileModel, IFile } from "../models/fileModel";
import { ioConfig } from '../socket/config';

const router = express.Router();

router.get('/', auth.setCurrentUser, async (req: any, res) => {
    const currentUser = req.user.name;
    const requestedFilesOfUser = req.query.username;
    if (requestedFilesOfUser === "Public" || currentUser === requestedFilesOfUser) {

        let files: IFile[] = await FileModel.find().byUser(requestedFilesOfUser).select("_id name size uploadDate");
        res.json(files);
        return;
    }
    res.sendStatus(403);
});

router.get('/download', auth.setCurrentUser, async (req: any, res) => {

    const username: string = req.user.name;
    const fileId: string = req.query.id;

    if (!fileId) {
        res.sendStatus(404);
        return;
    }

    let file: IFile = await FileModel.findOne().byId(fileId).where({ owner: { $in: [username, "Public"] } });
    if (file && fs.existsSync(file.fileLocation)) {
        res.download(file.fileLocation, file.name, (err) => {
            if (err) {
                console.log(`An error occured downloading the file ${file.name}`);
            } else
                console.log(`The file ${file.name} has been downloaded successfully`);
        });
        return;
    }

    res.sendStatus(404);
});

router.delete('/delete', auth.setCurrentUser, async (req: any, res) => {
    let fileId;
    try {
        fileId = new mongoose.Types.ObjectId(req.query.fileId.trim());
    }
    catch (error) {
        res.sendStatus(400);
        return;
    }
    const username = req.user.name;
    if (!fileId) {
        res.sendStatus(404);
        return;
    }

    let result = await FileModel.findOneAndDelete({ _id: fileId }).where({ owner: { $in: [username, "Public"] } });
    if (result == null) {
        res.sendStatus(404);
        return;
    }
    util.deleteFile(result.fileLocation);
    ioConfig.sendMessage("deleteFile", username, fileId)
    res.sendStatus(200);
});

router.delete('/deleteAll', auth.setCurrentUser, async (req: any, res) => {
    const currentUser = req.user.name;
    const requestedFilesOfUser = req.query.username;

    if (requestedFilesOfUser === "Public" || currentUser === requestedFilesOfUser) {
        const files = await FileModel.find().byUser(requestedFilesOfUser);
        if (!files) {
            res.sendStatus(404);
            return;
        }
        let filePaths: string[] = files.map((file: { fileLocation: any; }) => {
            return file.fileLocation;
        });
        util.deleteMultipleFiles(filePaths);
        await FileModel.deleteMany({ owner: requestedFilesOfUser });
        ioConfig.sendMessage("deleteAll", requestedFilesOfUser, requestedFilesOfUser === "Public" ? "public" : "private");
        res.sendStatus(200);
        return;
    }

    res.sendStatus(404);
});

router.post('/upload', auth.setCurrentUser, async (req: any, res) => {
    // store files
    let files = Array<any>();
    // set file owner
    let targetUser = "";
    // set file max file size to 10000 MB
    const maxFileSize = 10000 * 1024 * 1024;
    // create an incoming form object
    var form = new formidable.IncomingForm({
        multiples: true,
        uploadDir: path.join(__dirname, "/../../Files"),
        keepExtensions: true,
        maxFileSize: maxFileSize,
    });

    // every time a file has been uploaded successfully
    form.on('file', async (_, file) => {
        files.push(file);
    });

    form.on('fileBegin', (field, value) => {
        const currentUser = req.user.name;
        if (targetUser !== "Public" && currentUser !== targetUser) {
            throw new formidable.errors.FormidableError("unautherized", 0, 401);
        }

    })

    form.on('field', (field, value) => {
        if (field === "username") {
            targetUser = value;
        }
    })
    // log any errors that occur
    form.once('error', function (err) {
        console.error(err);
        res.sendStatus(400);
        return;
    });
    // once all the files have been uploaded, send a response to the client
    form.once('end', function () {
        const currentUser = req.user.name;
        if (targetUser === "Public" || currentUser === targetUser) {
            for (let file of files) {
                const newFile = new FileModel({
                    name: file.originalFilename,
                    size: file.size,
                    owner: targetUser,
                    fileLocation: file.filepath
                });
                newFile.save()
                    .catch(err => {
                        console.error(err);
                        res.sendStatus(400);
                    });
                ioConfig.sendMessage("newFile", targetUser, { "_id": newFile.id, "name": newFile.name, "size": newFile.size, "uploadDate": newFile.uploadDate, "table": targetUser == "Public" ? "public" : "private" });
            }
            res.end();
        }
        else {
            res.sendStatus(400);
        }
    });
    // parse the incoming request containing the form data
    form.parse(req, () => { });
});

export { router }