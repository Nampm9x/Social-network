export interface IGroupPost {
    _id: string;
    content: string;
    group: {
        _id: string;
        name: string;
        groupPicture: string;
    };
    owner: {
        _id: string;
        name: string;
        profilePicture: string;
        username: string;
    };
    images: string[];
    createdAt: string;
    likes: string[];
    status?: string;
    viewed?: string[];
}
