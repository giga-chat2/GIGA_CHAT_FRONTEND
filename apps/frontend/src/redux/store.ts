import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth-slice";
import emailReducer from "./features/email-slice";
import passwordReducer from "./features/password-slice";
import intialPopUpReducer from "./features/intialPopUp-slice";
import providerReducer  from "./features/provider-slice";
import { TypedUseSelectorHook, useSelector } from "react-redux";

export const store = configureStore({   
    reducer: {
        authReducer,
        emailReducer,
        passwordReducer,
        intialPopUpReducer,
        providerReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;