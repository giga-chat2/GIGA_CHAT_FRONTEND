import { createSlice,PayloadAction } from "@reduxjs/toolkit";

type initialStateType = {
    value:PasswordState
}
type PasswordState = {
    password:string
}
const initialState = {
    value:{
        password:'',
    }as PasswordState
}as initialStateType

export const password = createSlice({
    name: "password",
    initialState,
    reducers: {
        setCurrentPassword: (state, action:PayloadAction<string>) => {
            state.value.password = action.payload;
        },
    
    }

});

export const { setCurrentPassword } = password.actions;
export default password.reducer;
