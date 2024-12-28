export interface UserFile {
	id: number;
	name: string;
	size: number;
	owner: string;
	uploadDate: Date;
	fileLocation: string;
}

export interface FileResponse {
	id: number;
	name: string;
	size: number;
	uploadDate: Date;
}

export interface CreateFileRequest {
	name: string;
	size: number;
	owner: string;
	fileLocation: string;
}
