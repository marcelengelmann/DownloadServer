import express from 'express';
import passport from 'passport';
const router = express.Router();
import fs from "fs";
import path from "path";
import { auth } from "../config/auth";
const { exec } = require('child_process');


router.get("/", auth.ensureAdmin, (req, res) => {
    fs.readFile(path.join(__dirname, "../../Views/admin.html"), 'utf8', function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.end(data);
    });
});

router.get("/shutdownServer", auth.ensureAdmin, (req: any, res) => {
    res.status(200)
    res.end()
    const server = req.connection.server
    console.log('closing server')
    server.close(() => {
        console.log('Server closed.')
        process.exit(0)
    });
});

router.get("/shutdownComputer", auth.ensureAdmin, (req: any, res) => {
    res.status(200)
    res.end()
    const server = req.connection.server
    console.log("closing server.")
    server.close(() => {
        console.log('Server closed.')
        console.log("shutting down computer");
        exec('cmd /c shutdown -a & shutdown -s -f -t 0', (err: any, stdout: any, stderr: any) => {
            if (err) {
                console.log(err);
            }
            process.exit(0)
        });
    });
});

router.get("/crash", auth.ensureAdmin, (req: any, res) => {
    process.nextTick(function () {
        throw new Error;
    });
});

export { router }