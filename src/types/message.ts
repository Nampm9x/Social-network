export interface IMessage {
    _id: string;
    conversationId: string;
    sender: {
        username: string;
        name: string;
        profilePicture: string;
        _id: string;
    };
    text: string;
    read: string[];
    members: string[];
    received: boolean;
    sent: boolean;
    delivered: boolean;
    replyTo: {
        messageId: string;
        text: string;
        id: {
            username: string;
            name: string;
            profilePicture: string;
            _id: string;
        };
    },
    createdAt: string;
    type: string;
}