export interface INotification {
    _id: string;
    from: {
        name: string;
        username: string;
        profilePicture: string;
        _id: string;
    };
    to: [
        {
            name: string;
            username: string;
            profilePicture: string;
            _id: string
        }
    ];
    message: string;
    type: string;
    read: boolean;
    link: string;
    deleted: string[];
    createdAt: string;
}