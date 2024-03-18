import { createSlice,PayloadAction } from "@reduxjs/toolkit";

type initialStateType = {
    value:AuthState
}
type AuthState = {
    usedProviderAuth:boolean
}

const initialState = {
    value:{
        usedProviderAuth:true,
    }as AuthState
}as initialStateType

export const auth = createSlice({   
    name: "auth",
    initialState,
    reducers: {
        setUsedProviderAuth: (state, action:PayloadAction<boolean>) => {
            state.value.usedProviderAuth = action.payload;
        },
    
    }

});

export const { setUsedProviderAuth } = auth.actions;
export default auth.reducer;
