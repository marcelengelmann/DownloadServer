import { Server } from "socket.io";
import { FileResponse } from "../files/file";
type messageEvents = "newFile" | "deleteFile" | "deleteAll";

class SocketIo {
	private io!: Server;

	public setSocketConnection(
		server: any,
		middlewareFunctions: Array<Function>
	) {
		if (this.io) {
			console.warn("Socket.Io was already initialized.");
			return;
		}
		this.io = new Server(server);
		for (let func of middlewareFunctions) {
			this.io.use(this.wrap(func));
		}
		this.io.on("connection", (socket: any) => {
			socket.join("Public");
			if (socket.request.user?.username) {
				socket.join(socket.request.user.username);
			}
		});
	}

	public sendNewFile(newFile: FileResponse, targetUser: string) {
		socketIo.sendMessage("newFile", targetUser, {
			...newFile,
			table: targetUser == "Public" ? "public" : "private",
		});
	}

	public sendDeleteFile(fileId: number, targetUser: string) {
		socketIo.sendMessage("deleteFile", targetUser, fileId);
	}

	public sendDeleteAll(requestedFilesOfUser: string) {
		socketIo.sendMessage(
			"deleteAll",
			requestedFilesOfUser,
			requestedFilesOfUser === "Public" ? "public" : "private"
		);
	}

	private wrap = (middleware: any) => (socket: any, next: any) =>
		middleware(socket.request, {}, next);

	private sendMessage = (event: messageEvents, user: string, message: any) => {
		if (!this.io) {
			console.warn("Socket.Io was not initialized.");
			return;
		}
		this.io.to(user).emit(event, message);
	};
}

const socketIo = new SocketIo();

export { socketIo };
