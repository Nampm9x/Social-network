export interface IUserS {
    _id: string;
    username: string;
    name: string;
    profilePicture: string;
  }
  
  export interface IUser {
    _id: string;
    username: string;
    name: string;
    friends: IUserS[];
    followers: IUserS[];
    following: IUserS[];
    profilePicture: string;
    email: string;
    emailVisibility?: string;
    biography?: string;
    createdAt: string;
    birthday?: string;
    birthdayVisibility?: string;
    livesIn?: string;
    livesInVisibility?: string;
    status?: string;
    statusVisibility?: string;
    work?: string;
    workVisibility?: string;
    blocked?: string[];
  }
  