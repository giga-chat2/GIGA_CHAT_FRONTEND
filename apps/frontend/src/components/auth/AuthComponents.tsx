// @ts-nocheck
"use client"
import React, { FormEvent, useEffect, useState, useRef } from 'react'
import Swal from 'sweetalert2'
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';
import { setUsedProviderAuth } from '@/redux/features/auth-slice';
import { setCurrentEmail } from '@/redux/features/email-slice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setProvider } from '@/redux/features/provider-slice';
import { setCurrentPassword } from '@/redux/features/password-slice';
import { setVisiblePopUp } from '@/redux/features/intialPopUp-slice';
import { useAppSelector } from '@/redux/store';
import { useCookies } from 'react-cookie'
import axios from 'axios'
import setInitialData from '@/redux/features/initialData-slice';
import { useSession } from 'next-auth/react';


export const MoveToSignInButton: React.FC = () => {

    return (
        <>
            <button className="btn" id="sign-in-btn" onClick={() => document.querySelector(".container")?.classList.remove("sign-up-mode")}>
                Sign in
            </button>
        </>
    )
}

export const MoveToSignUpButton: React.FC = () => {
    return (
        <>
            <button className="btn" id="sign-up-btn" onClick={() => document.querySelector(".container")?.classList.add("sign-up-mode")}>
                Sign up
            </button>
        </>
    )
}

export const SignInForm: React.FC = () => {
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [disp, setDisp] = useState<boolean>(false)
    const { push } = useRouter();
    const dispatch = useDispatch<AppDispatch>()
    const [isPopUpVisible, setIsPopUpVisible] = useCookies(['isPopUpVisible']);
    const [emailCookie, setEmailCookie] = useCookies(['email']);
    const [cookies, setCookie] = useCookies(['provider']);

    const [mobileView, setMobileView] = useCookies(['mobileView'])

    const checkMobileView = () => {
        if (window.innerWidth <= 768) {
            setMobileView('mobileView', true, { path: '/' })
        } else {
            setMobileView('mobileView', false, { path: '/' })
        }
    }

    useEffect(() => {
        checkMobileView()
        window.addEventListener('resize', checkMobileView)
        return () => {
            window.removeEventListener('resize', checkMobileView)
        }
    }, [])


    const handleSignIn = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            fetch('https://giga-chat-2-backend.vercel.app/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }).then(async (res) => {
                if (res.status == 200) {
                    res = await res.json()
                    console.log(res)
                    // dispatch(setUsedProviderAuth(false))
                    // dispatch(setCurrentEmail(email))
                    setEmailCookie('email', email, { path: '/' })
                    dispatch(setCurrentPassword(password))
                    setIsPopUpVisible('isPopUpVisible', false, { path: '/' });
                    // push('/pages/allchats');
                    window.location.href = '/pages/allchats'

                }
                else if (res.status == 400) {
                    Swal.fire({
                        icon: "error",
                        title: "User does not exist",
                        text: "Invalid credentials,please try again!"
                    });
                }
                else if (res.status == 401) {
                    Swal.fire({
                        icon: "error",
                        title: "Invalid Credentials",
                        text: "Invalid credentials,please try again!"
                    });
                } else if (res.status == 500) {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Internal server error ,please try again later!"
                    });
                }
            })
        }
        catch (error) {
            console.log(error)
        }

    }

    useEffect(() => {
        setDisp(true)
    }, [])

    const handleSocialSignIn = async (provider: string) => {
        setCookie('provider', provider, { path: '/' });
        setIsPopUpVisible('isPopUpVisible', false, { path: '/' });
        signIn(provider, { callbackUrl: "/pages/allchats" })
    }

    return (
        <>
            {disp ? <>
                <form action="" onSubmit={handleSignIn} className="sign-in-form">
                    <h2 className="title">Sign in</h2>
                    <div className="input-field">
                        <i className="fas fa-user" />
                        <input type="text" placeholder="Enter your email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
                    </div>
                    <div className="input-field">
                        <i className="fas fa-lock" />
                        <input type="password" placeholder="Enter your password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
                    </div>
                    <input type="submit" defaultValue="Login" value="Login" id='login_btn' className="btn" />
                    {mobileView.mobileView ? <a href="#" id="sign-up-btn2" className='italic' onClick={() => document.querySelector(".container")?.classList.add("sign-up-mode")} >Don't have an account?</a> : <></>}
                    <p className="social-text">Or Sign in with social platform</p>
                    <div className="social-media">
                        <a className="social-icon" id="facebookIcon" onClick={() => handleSocialSignIn('facebook')} >
                            <i className="fab fa-facebook-f" />
                        </a>
                        <a className="social-icon" id="twitterIcon" onClick={() => handleSocialSignIn('twitter')}>
                            <i className="fa-brands fa-x-twitter" />
                        </a>
                        <a className="social-icon" id="googleIcon" onClick={() => handleSocialSignIn('google')}>
                            <i className="fab fa-google" />
                        </a>
                        <a className="social-icon" id='GitHubIcon' onClick={() => handleSocialSignIn('github')}>
                            <i className="fa-brands fa-github"></i>
                        </a>
                    </div>
                    {!mobileView.mobileView ?
                        <p className="account-text">
                            Don't have an account?{" "}
                            <a href="#" id="sign-up-btn2">
                                Sign up
                            </a>
                        </p> : <></>
                    }
                </form>
            </> : <></>}
        </>
    )
}


export const SignUpForm = () => {
    const [password, setPassword] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const { push } = useRouter();
    const [loading, setLoading] = useState(false)
    const [dispCodeDiv, setDispCodeDiv] = useState(false)
    const [enteredVerificationCode, setEnteredVerificationCode] = useState<string>('')
    const [verificationCode, setVerificationCode] = useState<string>('')
    const [disp, setDisp] = useState<boolean>(false)
    const [cookies, setCookie] = useCookies(['provider']);
    const [isPopUpVisible, setIsPopUpVisible] = useCookies(['isPopUpVisible']);
    const [emailCookie, setEmailCookie] = useCookies(['email']);
    const [mobileView, setMobileView] = useCookies(['mobileView'])

    useEffect(() => {
        setDisp(true)
    }, [])

    const dispatch = useDispatch<AppDispatch>()

    const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        if (!dispCodeDiv) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                Swal.fire({
                    icon: "error",
                    title: "Not a valid email",
                    text: "Please enter a valid email!"
                });
                setLoading(false)
                return
            }
            const passwordRegex = /^(?=.*[A-Za-z0-9])(?=.*[^A-Za-z0-9]).{8,}$/;
            if (!passwordRegex.test(password)) {
                Swal.fire({
                    icon: "error",
                    title: "Not a valid password",
                    text: "Password should be atleast 8 characters long and should contain special characters,letters and numbers!"
                });
                setLoading(false)
                return
            }
            const CustomToast = () => (
                <div className='bg-black text-white text-center ' >
                    <div className='bg-black' >Verification Code sent to your email!</div>
                </div>
            );

            try {
                const res = await fetch("https://giga-chat-2-backend.vercel.app/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password: null,
                        enteredVerificationCode: null
                    })
                }).then(async (res) => {

                    // console.log(res.status,res)
                    setDispCodeDiv(true)
                    setLoading(false)
                    if (res.status == 200) {
                        res = await res.json();
                        console.log(res)
                        setLoading(false);
                        toast(<CustomToast />, {
                            position: 'top-right',
                            autoClose: 100000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                        });
                        setVerificationCode(res?.verificationCode);
                        // dispatch(setUsedProviderAuth(true))
                        // push('/pages/allchats');
                    }
                    else if (res.status == 401) {
                        Swal.fire({
                            icon: "error",
                            title: "Username not available",
                            text: "Username is already taken!",
                        });
                        setLoading(false)
                        return
                    } else if (res.status == 400) {
                        Swal.fire({
                            icon: "error",
                            title: "Email already in use",
                            text: "Email is already in use!",
                        });
                        setLoading(false)
                        return
                    } else if (res.status == 500) {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "Internal server error ,please try again later!",
                        });
                        setLoading(false)
                        return
                    }
                })
            } catch (error) {
                console.log(error);
            }
        } else {
            console.log("called")
            setLoading(true)

            try {
                const res = await fetch("https://giga-chat-2-backend.vercel.app/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                        enteredVerificationCode,
                        hashedVerificationCode: verificationCode
                    }),
                }).then((res) => {
                    console.log(res.status, res.json())
                    if (res.status == 200) {
                        dispatch(setUsedProviderAuth(false))
                        // dispatch(setCurrentEmail(email))
                        setIsPopUpVisible('isPopUpVisible', true, { path: '/' });
                        setEmailCookie('email', email, { path: '/' })
                        console.log(password)
                        dispatch(setCurrentPassword(password))
                        push('/pages/allchats');

                    }
                })
            } catch (error) {
                console.log(error);
            }
        }
    }
    const inputRefs = Array.from({ length: 4 }, (_, i) => useRef(null));

    const handlePaste = (ev: ClipboardEvent) => {
        if ((ev.target as HTMLInputElement)?.localName !== 'input') return;
        ev.preventDefault();
        let paste = (ev.clipboardData || window.clipboardData).getData('text');
        paste = paste.toUpperCase();
        let inputs = inputRefs.map((ref) => ref.current);
        if (paste.length !== inputs.length) return; // handle as you want
        setEnteredVerificationCode(paste);
        inputs.forEach((input, index) => {
            input?.focus();
            input.value = paste[index];
        });
    };

    useEffect(() => {
        document.addEventListener('paste', handlePaste);
        return () => {
            document.removeEventListener('paste', handlePaste);
        };
    }, []);


    const handleSocialSignIn = (provider: string) => {
        // dispatch(setProvider(provider))
        setCookie('provider', provider, { path: '/' });
        setIsPopUpVisible('isPopUpVisible', true, { path: '/' });
        signIn(provider, { callbackUrl: "/pages/allchats" })
    }


    return (
        <>
            {disp ? <>
                <form onSubmit={handleSignUp} className="sign-up-form">
                    <div className={`flex flex-col items-center w-[100%] bg-black sign-up-details ${dispCodeDiv ? 'animate-up' : ''} `} >
                        <h2 className="title">Sign up</h2>
                        <div className="input-field">
                            <i className="fas fa-envelope" />
                            <input type="text" placeholder="Enter your email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
                        </div>
                        <div className="input-field">
                            <i className="fas fa-lock" />
                            <input type="password" placeholder="Enter your password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
                        </div>
                    </div>
                    {/* {dispCodeDiv ? <> */}
                    <div className='verification_code_container' >
                        <div id="codeForm" >
                            {[0, 1, 2, 3].map((index) => (
                                <input
                                    key={index}
                                    ref={inputRefs[index]}
                                    type='number'
                                    className='code__input'
                                    autoFocus={index === 0}
                                    maxLength={1}
                                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const target = e.target as HTMLInputElement;
                                        target.value = e.target.value.toUpperCase();

                                        setEnteredVerificationCode(inputRefs.map(ref => ref.current?.value).join(''));

                                        if (target.value === '') {
                                            inputRefs[index - 1]?.current?.focus();
                                        } else {
                                            inputRefs[index + 1]?.current?.focus();
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <input type="submit" value={ dispCodeDiv && loading ? "Verifying Code..." :   dispCodeDiv ? "Submit Code" : loading ? "Verifying..." : "Get Code" } id='register_btn' className="btn" />
                    {mobileView.mobileView ? <a href="#" id="sign-up-btn2" className='italic' onClick={() => document.querySelector(".container")?.classList.remove("sign-up-mode")} >Already have an account?</a> : <></>}
                    <p className="social-text">Or Sign in with social platform</p>
                    <div className="social-media">
                        <a className="social-icon" id="facebookIcon" onClick={() => handleSocialSignIn('facebook')} >
                            <i className="fab fa-facebook-f" />
                        </a>
                        <a className="social-icon" id="twitterIcon" onClick={() => handleSocialSignIn('twitter')}>
                            <i className="fa-brands fa-x-twitter" />
                        </a>
                        <a className="social-icon" id="googleIcon" onClick={() => handleSocialSignIn('google')} >
                            <i className="fab fa-google" />
                        </a>
                        <a className="social-icon" id='GitHubIcon' onClick={() => handleSocialSignIn('github')}>
                            <i className="fa-brands fa-github"></i>
                        </a>
                    </div>
                    <p className="account-text">
                        Already have an account?{" "}
                        <a href="#" id="sign-in-btn2">
                            Sign In
                        </a>
                    </p>
                </form>
                <ToastContainer />
            </> : <></>}
        </>
    )
}
