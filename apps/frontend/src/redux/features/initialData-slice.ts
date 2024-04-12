import { createSlice,PayloadAction } from "@reduxjs/toolkit";

type UserData = {
    name: string;
    username: string;
    email: string;
    password: string;
    phoneno: string;
    provider: string;
    roomId: string;
    profilePic: string;
    createdAt: number;
    isArchived: boolean;
    _id: string;
    chats: any[];
    lastChatTime: number; 
};

type InitialDataState = {
    initialData: UserData[];
};

const initialState: InitialDataState = {
    initialData: [],
};

export const initialData = createSlice({
    name: "initialData",
    initialState,
    reducers: {
        setInitialData: (state, action: PayloadAction<UserData[]>) => {
            state.initialData = action.payload;
        },
    },
});


export const { setInitialData } = initialData.actions;
export default initialData.reducer;

