import { Server } from "socket.io";
let io: Server;

type messageEvents = "newFile" | "deleteFile" | "deleteAll";

const wrap = (middleware: any) => (socket: any, next: any) => middleware(socket.request, {}, next);

const ioConfig = {
    setSocketConnection: (server: any, middlewareFunctions: Array<Function>) => {
        io = new Server(server);
        for (let func of middlewareFunctions) {
            io.use(wrap(func));
        }
        io.on("connection", (socket: any) => {
            socket.join("Public");
            if (socket.request.user?.name) {
                socket.join(socket.request.user.name);
            }

        })
    },
    sendMessage: (event: messageEvents, user: string, message: any) => {
        io.to(user).emit(event, message);
    }
}


export { ioConfig }