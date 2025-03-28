interface IUser {
    _id: string;
    username: string;
    name: string;
    profilePicture: string;
}

export interface IConversation {
    _id: string;
    conversationPicture: string;
    conversationName: string;
    conversationType: string;
    lastMessage: string;
    lastMessageSender: IUser;
    lastMessageTime: string;
    lastMessageReceived?: boolean;
    lastMessageSent?: boolean;
    lastMessageDelivered?: boolean;
    createdAt: string;
    admin: IUser;
    lastMessageRead: IUser[];
    members: IUser[];
    archives?: IUser[];
    deleted?: IUser[];
}
