export enum UserRole {
	Admin = "Admin",
	User = "User",
}

export interface User {
	id: number;
	username: string;
	password: string;
	role: UserRole;
	creationDate: Date;
	salt: string;
}

export interface CreateUserRequest {
	username: string;
	password: string;
	role: UserRole;
}

export interface UserResponse {
	username: string;
	password: string;
	role: UserRole;
}
