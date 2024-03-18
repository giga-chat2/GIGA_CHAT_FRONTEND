import React from 'react'
import './index.css'
import { MoveToSignInButton ,MoveToSignUpButton,SignInForm ,SignUpForm} from './AuthComponents'



const Auth:React.FC = () => {

    return (
        <>
            <div className="h-screen w-screen flex justify-center items-center bg-black ">
                <div className="container">
                    <div className="signin-signup">
                        <SignInForm/>
                        <SignUpForm/>
                    </div>
                    <div className="panels-container">
                        <div className="panel left-panel">
                            <div className="content">
                                <h3>Already a member of GIGA-CHAT?</h3>
                                <p>
                                    Click the button below to sign-in
                                </p>
                                <MoveToSignInButton />
                            </div>
                            {/* <img src="signin.svg" alt="" className="image" /> */}
                        </div>
                        <div className="panel right-panel">
                            <div className="content">
                                <h3>New to GIGA-CHAT?</h3>
                                <p>
                                    Click the button below to sign-up
                                </p>
                                <MoveToSignUpButton />
                            </div>
                            {/* <img src="signup.svg" alt="" className="image" /> */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Auth