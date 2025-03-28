export interface IPost {
    _id: string;
    owner: {
        username: string;
        profilePicture: string;
        name: string;
        _id: string;
    };
    content: string;
    visibility: string;
    images: string[];
    likes: string[];
    createdAt: string;
    viewed: string[];
}