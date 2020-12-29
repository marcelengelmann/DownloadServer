import path from "path";
import fs from "fs";
const User = require("../models/user");
const cleanFilesFolder = () => {
    console.log("cleaning files folder");
    const filesDir = path.join(__dirname, "../Files");
    User.find({}, 'name', (err: Error, users: any) => {

        if (err) throw err;
        users = users.map((user:any) => user.name);
        
        fs.readdir(filesDir, (error, directories) => {

            if (error) throw error;
            directories.forEach(directory => {
                
                if (directory === "Public")
                    return;
                if (!users.includes(directory)) {
                    fs.rmdirSync(path.join(filesDir, directory), { recursive: true });
                }
            })
        });

    });

    console.log("finished cleaning files folder");
}

export { cleanFilesFolder };