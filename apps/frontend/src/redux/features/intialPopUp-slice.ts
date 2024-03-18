import { createSlice,PayloadAction } from "@reduxjs/toolkit";

type initialStateType = {
    value:VisiblePopUpState
}

type VisiblePopUpState = {
    visiblePopUp : boolean
}

const initialState = {
    value:{
        visiblePopUp:true,
    }as VisiblePopUpState
}as initialStateType

export const initialPopUp = createSlice({
    name: "initialPopUp",
    initialState,
    reducers: {
        setVisiblePopUp: (state, action:PayloadAction<boolean>) => {
            state.value = {
                ...state.value,
                visiblePopUp: action.payload,
            };
        },
    }
});

export const {setVisiblePopUp} = initialPopUp.actions;
export default initialPopUp.reducer;

