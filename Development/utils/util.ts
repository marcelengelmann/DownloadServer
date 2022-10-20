import { promises as fs } from "fs";

const util = {
    deleteFile: async (path: string) => {
        try {
            await fs.unlink(path);
        } catch (_) {
        }
    },
    deleteMultipleFiles: async (filePaths: string[]) => {
        for await (const file of filePaths) {
            util.deleteFile(file);
        }
    }
}

export default util;