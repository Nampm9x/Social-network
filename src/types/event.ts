export interface IEvent {
    _id: string;
    title: string;
    description: string;
    date: Date;
    duration: string;
    location: string;
    owner: {
        name: string;
        username: string;
        profilePicture: string,
        _id: string,
    };
    visibility: string;
    likes: string[];
    createdAt: string;
    image: string;
    time: string;
    followers: string[];
    viewed?: string[];
}