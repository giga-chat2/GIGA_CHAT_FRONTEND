import { createSlice,PayloadAction } from "@reduxjs/toolkit";

type initialStateType = {
    value:EmailState
}
type EmailState = {
    email:string
}
const initialState = {
    value:{
        email:'',
    }as EmailState
}as initialStateType

export const email = createSlice({
    name: "email",
    initialState,
    reducers: {
        setCurrentEmail: (state, action:PayloadAction<string>) => {
            state.value.email = action.payload;
        },
    
    }

});

export const { setCurrentEmail } = email.actions;
export default email.reducer;