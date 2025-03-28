import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface IUserState {
  currentUser: any;
}

const initialState: IUserState = {
  currentUser: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginStatus: (state, action: PayloadAction<any>) => {
      state.currentUser = action.payload;
    },
    editProfileStatus: (state, action: PayloadAction<any>) => {
      state.currentUser = action.payload;
    },
    logout: (state) => {
      state.currentUser = null;
    },
    followOtherUser: (state, action: PayloadAction<string>) => {
      if (state.currentUser) {
        const userId = action.payload;
        const index = state.currentUser?.following.indexOf(userId);
        if (index !== -1) {
          state.currentUser?.following.splice(index, 1);
        } else {
          state.currentUser?.following.push(userId);
        }
      }
    },
  },
});

export const { loginStatus, logout, editProfileStatus, followOtherUser } = userSlice.actions;

export default userSlice.reducer;