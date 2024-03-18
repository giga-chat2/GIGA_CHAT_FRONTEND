import { createSlice,PayloadAction } from "@reduxjs/toolkit";

type initialStateType = {
    value:ProviderState
}

type ProviderState = {
    provider : string
}

const initialState = {
    value:{
        provider:""
    }as ProviderState
}as initialStateType

export const provider = createSlice({
    name: "provider",
    initialState,
    reducers: {
        setProvider: (state, action:PayloadAction<string>) => {
            state.value.provider = action.payload;
        },
    }
});

export const {setProvider} = provider.actions;
export default provider.reducer;
