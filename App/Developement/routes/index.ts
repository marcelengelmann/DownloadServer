import express from 'express';
import fs from "fs";
const router = express.Router();

router.get('/', (req, res) => {   
    fs.readFile(__dirname + "/../Views/index.html", 'utf8', function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.end(data);
    });
});

router.get('*', (req, res) => {
    res.redirect("/");
});

router.post('*', (req, res) => {
    res.redirect("/");
});

router.put('*', (req, res) => {
    res.redirect("/");
});

router.delete('*', (req, res) => {    
    res.redirect("/");
});

export { router }