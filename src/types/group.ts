import { IPost } from "./post";

interface IUser {
    name: string;
    profilePicture: string;
    username: string;
    _id: string;
}

export interface IGroup {
    _id: string;
    name: string;
    description: string;
    owner: IUser;
    groupPicture: string;
    groupVisibility: string;
    members: IUser[];
    posts: IPost[];
    pendingMembers?: IUser[];
    pendingPosts?: IPost[];
    createdAt: string;
}