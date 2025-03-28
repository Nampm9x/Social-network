export interface IComment {
    _id: string;
    eventId: string;
    owner: {
        name: string;
        username: string;
        profilePicture: string;
        _id: string;
    }
    comment: string;
    likes: string[];
    createdAt: string;
    replyingTo: string;
}