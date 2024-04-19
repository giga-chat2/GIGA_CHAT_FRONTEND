// @ts-nocheck
"use client"
import React, { useEffect, useState, useRef } from 'react'
import PersonIcon from '@mui/icons-material/Person';
import { useCookies } from 'react-cookie'
import { RefObject } from 'react';
import axios from 'axios';
import './index.css'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import 'react-dropdown/style.css';
import Swal from 'sweetalert2'
import { nanoid } from '@reduxjs/toolkit';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
type Event = MouseEvent | TouchEvent;
import DeleteIcon from '@mui/icons-material/Delete';
import { useSession } from 'next-auth/react';
import Typewriter from 'typewriter-effect';


export const useClickOutside = <T extends HTMLElement = HTMLElement>(
    ref: RefObject<T>,
    handler: (event: Event) => void
) => {
    useEffect(() => {
        const listener = (event: Event) => {
            const el = ref?.current;
            if (!el || el.contains((event?.target as Node) || null)) {
                return;
            }
            handler(event); // Call the handler only if the click is outside of the element
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};

export const MainComponent: React.FC = () => {
    const [btnCount, setBtnCount] = useState<number>(0)
    const [isChatWindowVisible, setIsChatWindowVisible] = useState<boolean | null>(null)
    const [model, setModel] = useState<string>("")
    const [typedMessage, setTypedMessage] = useState<string>("")
    const [messages, setMessages] = useState<object[]>([])
    const [profilePicPath, setProfilePicPath] = useCookies(['profilePicPath'])
    const [dispProfilePic, setDispProfilePic] = useState<boolean>(false)
    const [currentUser, setCurrentUser] = useCookies(['username'])
    const [userClicked, setUserClicked] = useState<number | undefined>()
    const [chatHistory, setChatHistory] = useState<object[]>([{}])
    const [emailCookie, setEmailCookie] = useCookies(['email' as string])

    const session = useSession()

    useEffect(() => {
        if (session?.status === 'authenticated') {
            setEmailCookie('email', session?.data?.user?.email, { path: '/' })
        }
        else if(session?.status === 'unauthenticated'){
            window.location.href = '/pages/auth'
        }
    },[])


    const fetchInitialData = async () => {
        try {
            const res = await axios.post("https://giga-chat-2-backend.vercel.app/getAIChats", { currentUsername: currentUser?.username })
            const data = res.data
            setChatHistory(data)
        } catch (e) {
            console.log(e)
        }
    }
    useEffect(() => {
        fetchInitialData()
    }, [])

    const handleModelChoose = async (isFirstTime: boolean, btnNumber: number, modelName: string) => {
        let session;
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
        Toast.fire({
            icon: "success",
            title: `${modelName === 'mistral' ? 'Mixtral-8x7B' : modelName === 'openai' ? 'GPT 3.5-turbo' : modelName === 'gemma' ? 'Gemma-7b' : modelName === 'meta' ? 'LLAMA2' : modelName === 'antrophic' ? 'Claude 2' : modelName === 'gemini' ? 'Gemini-Pro' :  null } choosed Successfully!`
        });
        setBtnCount(btnNumber)
        setModel(modelName)
        if (isFirstTime) {
            if (sessionStorage.getItem('sessionId')) {
                session = sessionStorage.getItem('sessionId');
            }
            else {
                session = nanoid()
                sessionStorage.setItem('sessionId', session as string)
                // setSessionNumber('sectionNumber', session, { path: '/' })
            }
            setMessages([{ model: modelName, isSender: false, message: `Hello, I am ${modelName === 'mistral' ? 'Mixtral-8x7B' : modelName === 'openai' ? 'GPT 3.5-turbo' : modelName === 'gemma' ? 'Gemma-7b' : modelName === 'meta' ? 'LLAMA2' : modelName === 'antrophic' ? 'Claude 2' : modelName === 'gemini' ? 'Gemini-Pro' :  null} your AI assistant. How can I help you?` }])
        } else {
            session = sessionStorage.getItem('sessionId');
            setMessages((prevChats) => [{ model: modelName, isSender: false, message: `Hello, I am ${modelName === 'mistral' ? 'Mixtral-8x7B' : modelName === 'openai' ? 'GPT 3.5-turbo' : modelName === 'gemma' ? 'Gemma-7b' : modelName === 'meta' ? 'LLAMA2' : modelName === 'antrophic' ? 'Claude 2' : modelName === 'gemini' ? 'Gemini-Pro' :  null} your AI assistant. How can I help you?` }, ...prevChats])
            setDropdownClicked(false)
        }
        try {
            const now = new Date();
            const currentTime = `${now.getMinutes()}:${now.getSeconds()}`;
            const res = await axios.post("https://giga-chat-2-backend.vercel.app/addAIChat", { message: `Hello, I am ${modelName === 'mistral' ? 'Mixtral-8x7B' : modelName === 'openai' ? 'GPT 3.5-turbo' : modelName === 'gemma' ? 'Gemma-7b' : modelName === 'meta' ? 'LLAMA2' : modelName === 'antrophic' ? 'Claude 2' : modelName === 'gemini' ? 'Gemini-Pro' :  null} your AI assistant. How can I help you?`, session: session, currentUsername: currentUser?.username, model: modelName, startingTime: currentTime, endingTime: currentTime, isSender: false })
            const data = res.data
            console.log(data)
        } catch (e) {
            console.log(e)
        }
    }
    useEffect(() => {
        if (profilePicPath.profilePicPath && profilePicPath.profilePicPath !== "undefined") {
            setDispProfilePic(true)
        }
        setIsChatWindowVisible(true);
    }, [])


    const containerStyle = {
        transition: 'transform 1.5s ease',
        transform: btnCount !== 0 ? 'translateY(-300%)' : 'none',
    };
    const [botTyping, setBotTyping] = useState<boolean>(false)
    const [lastestMessage, setLastestMessage] = useState<number>(0)


    const handleChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setBotTyping(true)
        const now = new Date();
        const currentTime = `${now.getMinutes()}:${now.getSeconds()}`;
        setMessages((prevMessages) => [{ message: typedMessage, isSender: true }, ...prevMessages])
        setTypedMessage("")
        let session = sessionStorage.getItem('sessionId')
        try {
            const res = await axios.post("https://giga-chat-2-backend.vercel.app/modelResponse", { model: model, message: typedMessage })
            setMessages((prevMessages) => [{ model: model, message: res.data.message, isSender: false, imageURL: res.data.imageURL, messageNumber: lastestMessage + 1 }, ...prevMessages])
            setLastestMessage(lastestMessage + 1)
            const userResponse = await axios.post("https://giga-chat-2-backend.vercel.app/addAIChat", { message: typedMessage, session: session, currentUsername: currentUser?.username, model: model, isSender: true  })
            const botResponse = await axios.post("https://giga-chat-2-backend.vercel.app/addAIChat", { message: res.data.message, session: session, currentUsername: currentUser?.username, model: model, isSender: false, endingTime: currentTime,imageURL: res.data.imageURL })
            setBotTyping(false)
        } catch (e) {
            console.log(e)
        }
    }

    const [dropdownClicked, setDropdownClicked] = useState<boolean>(false)

    const handleDropDown = () => {
        setDropdownClicked(!dropdownClicked)
    }

    function convertTo12Hour(time: string) {
        if (time) {
            let [hours, minutes] = time.split(':');
            let period = +hours < 12 ? 'AM' : 'PM';
            hours = +hours % 12 || 12;
            return `${hours}:${minutes} ${period}`;
        }
    }

    const handleChatClicked = async (idx: number) => {
        setUserClicked(idx)
        console.log(chatHistory[idx].messages)
        let lst = [...chatHistory[idx].messages]
        setMessages(lst.reverse())
        console.log(chatHistory[idx].messages)
        sessionStorage.setItem('sessionId', chatHistory[idx].session as string)
        if (chatHistory[idx]?.messages[chatHistory[idx]?.messages.length - 1].model === 'openai') {
            setBtnCount(1)
            setModel('openai')
        }
        else if (chatHistory[idx]?.messages[chatHistory[idx]?.messages.length - 1].model === 'antrophic') {
            setBtnCount(2)
            setModel('antrophic')
        }
        else if (chatHistory[idx]?.messages[chatHistory[idx]?.messages.length - 1].model === 'meta') {
            setBtnCount(3)
            setModel('meta')
        }
        else if (chatHistory[idx]?.messages[chatHistory[idx]?.messages.length - 1].model === 'gemma') {
            setBtnCount(4)
            setModel('gemma')
        }
        else if (chatHistory[idx]?.messages[chatHistory[idx]?.messages.length - 1].model === 'mistral') {
            setBtnCount(5)
            setModel('mistral')
        }
        else if (chatHistory[idx]?.messages[chatHistory[idx]?.messages.length - 1].model === 'gemini') {
            setBtnCount(5)
            setModel('gemini')
        }

    }

    const handleStartNewChat = () => {
        setModel("")
        setMessages([])
        setTypedMessage("")
        setBtnCount(0)
        let session = nanoid()
        sessionStorage.setItem('sessionId', session)
    }
    const handleDeleteChat = async (idx: number) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await axios.post('https://giga-chat-2-backend.vercel.app/deleteAiChat', { currentUsername: currentUser?.username, chat: chatHistory[idx] })
                    if(res.status == 200){
                        Swal.fire(
                            'Deleted!',
                            'Your chat has been deleted.',
                            'success'
                        )
                    }else if(res.status == 400){
                        Swal.fire(
                            'Error!',
                            'Your chat could not be deleted.',
                            'error'
                        )
                    }else if (res.status == 500){
                        Swal.fire(
                            'Error!',
                            'Internal server error',
                            'error'
                        )
                    }else if (res.status == 404){
                        Swal.fire(
                            'Error!',
                            'Chat not found',
                            'error'
                        )
                    }
                    let upDatedChats = chatHistory.filter((chat, index) => index !== idx)
                    setChatHistory(upDatedChats)
                } catch (e) {
                    console.log(e)
                }
            }
        })


    }




    return (
        <>


            <div className='w-[85vw] h-screen flex flex-row overflow-x-hidden overflow-y-hidden'>
                <div className='w-[20vw] min-w-[20vw] h-[100%] relative '>
                    <div className='w-[100%] h-[90%] relative'>
                        <div className='w-[100%] h-[7%] mt-6 flex justify-center items-center p-1'>
                            <PsychologyIcon sx={{ color: "#fff", width: "20%", height: "70%", padding: "0", marginBottom: "1%" }} />

                            <p className='w-[100%] h-[90%] text-xl font-semibold text-white ' >Chats History</p>
                        </div>
                        <div className='w-[100%] h-[7%] flex justify-center items-center  ' >
                            <div className='w-[100%] rounded-md h-[100%] bg-[#1e232c] cursor-pointer text-white text-center flex justify-center items-center text-lg font-bold  hover:bg-[#3d3c3c] hover:text-white' onClick={handleStartNewChat} > Start New Chat + </div>
                        </div>
                        <div className='w-[100%] h-[100%] overflow-y-scroll searchResults '>
                            <div className='flex flex-col items-center w-[100%] relative z-10 mt-1 h-[95%] overflow-y-scroll' >
                                {chatHistory.length > 0 ? chatHistory.map((chat, idx) => (
                                    <div className={`w-[100%] h-[70px] flex mb-2 p-2 cursor-pointer justify-start rounded-md items-center mt-1 bg-[${userClicked === idx ? '#3d3c3c' : '#1e232c'}] hover:bg-[#3d3c3c] hover:text-white`} >
                                        <div className='w-[20%] h-[100%] flex justify-center  items-center ' >
                                            <ChatBubbleIcon sx={{ width: "60%", height: "60%", color: "white" }} />
                                        </div>
                                        <div className='w-[70%] h-[100%] ml-2 flex flex-col justify-center items-center ' onClick={() => handleChatClicked(idx)} >
                                            <p className='text-white w-[100%] h-[80%] flex justify-start items-center text-xl font-bold ' >{new Date(chat?.date).toLocaleDateString('en-GB')}</p>
                                            <p className='text-white w-[100%] h-[20%] flex justify-start italic mb-2 '> {convertTo12Hour(chat.startingTime)} - {convertTo12Hour(chat.endingTime)} </p>
                                        </div>
                                        <div className='w-[10%] h-[100%] flex justify-center items-center ' onClick={() => handleDeleteChat(idx)} >
                                            <DeleteIcon sx={{ color: "white", width: "60%", height: "60%" }} className='deleteIconAskAi' />
                                        </div>
                                    </div>
                                )) : <>
                                    <div className='w-[80%] flex flex-col justify-center items-center text-white h-[20%] clickHereAnimation3 ' >
                                        <TrendingFlatIcon sx={{ color: "white", width: "30%", height: "50%" }} /> Start Chatting with AI
                                    </div>
                                </>}
                            </div>
                        </div>

                    </div>
                </div>
                <div className='w-[50%] h-[100px] absolute right-[7%] top-[20%] z-10 flex justify-center items-center   ' style={containerStyle} >
                    <div className=' w-[90%] h-[90%] px-2 relative flex justify-center items-center rounded-lg bg-[#1e232c] ' >
                        <div className={`w-[20%] h-[80%] relative  rounded-s-lg text-white flex flex-col justify-center items-center cursor-pointer bg-[${btnCount === 1 ? "#1a46c9" : "#1e52ee"}] hover:bg-[#1a46c9] model-box `} onClick={() => handleModelChoose(true, 1, "openai")} ><p className='font-bold' >GPT 3.5 turbo</p> <p className='font-thin italic' >Open AI</p> </div>
                        <div className={`w-[20%] h-[80%] relative border-x border-white text-white flex flex-col justify-center items-center cursor-pointer bg-[${btnCount === 2 ? "#1a46c9" : "#1e52ee"}] hover:bg-[#1a46c9] model-box `} onClick={() => handleModelChoose(true, 2, "antrophic")} ><p className='font-bold' >Claude 2</p> <p className='font-thin italic' >Antrophic</p> </div>
                        <div className={`w-[20%] h-[80%] relative  border-e border-white text-white flex flex-col justify-center items-center cursor-pointer bg-[${btnCount === 3 ? "#1a46c9" : "#1e52ee"}] hover:bg-[#1a46c9] model-box `} onClick={() => handleModelChoose(true, 3, "meta")} ><p className='font-bold' >  LLAMA2</p> <p className='font-thin italic' >Meta</p> </div>
                        <div className={`w-[20%] h-[80%] relative  border-e text-white flex flex-col justify-center items-center cursor-pointer bg-[${btnCount === 4 ? "#1a46c9" : "#1e52ee"}] hover:bg-[#1a46c9] model-box `} onClick={() => handleModelChoose(true, 4, "gemma")} ><p className='font-bold' >Gemma-7b</p> <p className='font-thin italic' >Google</p> </div>
                        <div className={`w-[20%] h-[80%] relative  rounded-e-lg text-white flex flex-col justify-center items-center cursor-pointer bg-[${btnCount === 4 ? "#1a46c9" : "#1e52ee"}] hover:bg-[#1a46c9] model-box `} onClick={() => handleModelChoose(true, 4, "mistral")} ><p className='font-bold' >Mixtral-8x7B</p> <p className='font-thin italic' >Mistralai</p></div>
                    </div>
                </div>
                {dropdownClicked ? <>
                    <div className={`w-[15%] h-[25%] absolute bg-black z-50 right-[4%] top-[5%] rounded-md flex flex-col border border-white ml-[auto] model-options-appear `}  >
                        <div className='h-[20%] rounded-t-md flex w-[100%] cursor-pointer items-center justify-start hover:bg-white hover:text-black model-option ' onClick={() => handleModelChoose(false, 1, "openai")} >
                            <img src={`https://firebasestorage.googleapis.com/v0/b/giga-chat-9416b.appspot.com/o/modelImages%2Fopenai.png?alt=media&token=9e6f0bd8-a12c-434a-a41d-045575fddd1b`} alt="profile" style={{ width: "25px", height: "25px", marginLeft: "5px", objectFit: "cover" }} /> <p className='text-white ml-2 hover:bg-white hover:text-black font-mono model-option-text' >GPT 3.5 turbo</p>
                        </div>
                        <div className='h-[20%]  w-[100%] flex items-center justify-start  cursor-pointer hover:bg-white hover:text-black model-option ' onClick={() => handleModelChoose(false, 2, "antrophic")} >
                            <img src={`https://firebasestorage.googleapis.com/v0/b/giga-chat-9416b.appspot.com/o/modelImages%2Fantrophic.png?alt=media&token=8720acb0-83f6-4faf-9628-cce425f1221b`} alt="profile" style={{ width: "25px", height: "25px", objectFit: "cover", marginLeft: "5px" }} /> <p className='text-white ml-2 hover:bg-white hover:text-black font-mono model-option-text' >Claude 2</p>

                        </div>
                        <div className='h-[20%] w-[100%] flex items-center justify-start  cursor-pointer hover:bg-white hover:text-black model-option ' onClick={() => handleModelChoose(false, 3, "meta")} >
                            <img src={`https://firebasestorage.googleapis.com/v0/b/giga-chat-9416b.appspot.com/o/modelImages%2Fmeta.png?alt=media&token=fd3ae277-ea8c-49c4-8cff-3b6f228cd095`} alt="profile" style={{ width: "25px", height: "25px", objectFit: "cover", marginLeft: "5px" }} /> <p className='text-white ml-2 hover:bg-white hover:text-black  font-mono model-option-text' >Llama 2</p>

                        </div>
                        <div className='h-[20%] w-[100%] flex items-center justify-start cursor-pointer hover:bg-white hover:text-black model-option ' onClick={() => handleModelChoose(false, 4, "gemma")} >
                            <img src={`https://firebasestorage.googleapis.com/v0/b/giga-chat-9416b.appspot.com/o/modelImages%2Fgemma.png?alt=media&token=88575525-9045-4ca8-bb0b-e152b17fd8d6`} alt="profile" style={{ width: "25px", height: "25px", objectFit: "cover", marginLeft: "5px" }} /> <p className='text-white ml-2 hover:bg-white hover:text-black  font-mono model-option-text' >Gemma-7b</p>

                        </div>
                        <div className='h-[20%]  rounded-b-md w-[100%] flex items-center justify-start  cursor-pointer hover:bg-white hover:text-black model-option ' onClick={() => handleModelChoose(false, 5, "mistral")} >
                            <img src={`https://firebasestorage.googleapis.com/v0/b/giga-chat-9416b.appspot.com/o/modelImages%2Fmistral.png?alt=media&token=a4049518-19f5-4e41-acce-89c7e598a4af`} alt="profile" style={{ width: "25px", height: "25px", objectFit: "cover", marginLeft: "5px" }} /> <p className='text-white ml-2 hover:bg-white hover:text-black  font-mono model-option-text' >Mixtral-8x7B</p>
                        </div>
                        <div className='h-[20%]  rounded-b-md w-[100%] flex items-center justify-start  cursor-pointer hover:bg-white hover:text-black model-option ' onClick={() => handleModelChoose(false, 5, "gemini")} >
                            <img src={`https://firebasestorage.googleapis.com/v0/b/giga-chat-9416b.appspot.com/o/modelImages%2Fgemini.png?alt=media&token=2e11ca17-ba6a-4835-9721-31435c0cbf93`} alt="profile" style={{ width: "25px", height: "25px", objectFit: "cover", marginLeft: "5px" }} /> <p className='text-white ml-2 hover:bg-white hover:text-black  font-mono model-option-text' >Gemini-Pro</p>
                        </div>
                    </div>
                </> : <>
                    <div className={`w-[15%] h-[25%] absolute z-50 bg-black right-[4%] top-[5%] rounded-md flex flex-col border border-white ml-[auto] model-options-disappear `} >
                        <div className='h-[20%] rounded-t-md flex w-[100%] cursor-pointer items-center justify-start hover:bg-white ' >
                            <img src={`https://firebasestorage.googleapis.com/v0/b/giga-chat-9416b.appspot.com/o/modelImages%2Fopenai.png?alt=media&token=9e6f0bd8-a12c-434a-a41d-045575fddd1b`} alt="profile" style={{ width: "25px", height: "25px", marginLeft: "5px", objectFit: "cover" }} /> <p className='text-white ml-2 hover:bg-white hover:text-black font-mono' >GPT 3.5 turbo</p>
                        </div>
                        <div className='h-[20%]  w-[100%] flex items-center justify-start  cursor-pointer hover:bg-white ' >
                            <img src={`https://firebasestorage.googleapis.com/v0/b/giga-chat-9416b.appspot.com/o/modelImages%2Fantrophic.png?alt=media&token=8720acb0-83f6-4faf-9628-cce425f1221b`} alt="profile" style={{ width: "25px", height: "25px", objectFit: "cover", marginLeft: "5px", }} /> <p className='text-white ml-2 hover:bg-white hover:text-black font-mono' >Claude 2</p>

                        </div>
                        <div className='h-[20%] w-[100%] flex items-center justify-start  cursor-pointer hover:bg-white' >
                            <img src={`https://firebasestorage.googleapis.com/v0/b/giga-chat-9416b.appspot.com/o/modelImages%2Fmeta.png?alt=media&token=fd3ae277-ea8c-49c4-8cff-3b6f228cd095`} alt="profile" style={{ width: "25px", height: "25px", objectFit: "cover", marginLeft: "5px", }} /> <p className='text-white ml-2 hover:bg-white hover:text-black  font-mono' >Llama 2</p>

                        </div>
                        <div className='h-[20%] w-[100%] flex items-center justify-start cursor-pointer hover:bg-white' >
                            <img src={`https://firebasestorage.googleapis.com/v0/b/giga-chat-9416b.appspot.com/o/modelImages%2Fgemma.png?alt=media&token=88575525-9045-4ca8-bb0b-e152b17fd8d6`} alt="profile" style={{ width: "25px", height: "25px", objectFit: "cover", marginLeft: "5px", }} /> <p className='text-white ml-2 hover:bg-white hover:text-black  font-mono' >Gemma-7b</p>

                        </div>
                        <div className='h-[20%]  rounded-b-md w-[100%] flex items-center justify-start  cursor-pointer hover:bg-white ' >
                            <img src={`https://firebasestorage.googleapis.com/v0/b/giga-chat-9416b.appspot.com/o/modelImages%2Fmistral.png?alt=media&token=a4049518-19f5-4e41-acce-89c7e598a4af`} alt="profile" style={{ width: "25px", height: "25px", objectFit: "cover", marginLeft: "5px", }} /> <p className='text-white ml-2 hover:bg-white hover:text-black  font-mono' >Mixtral-8x7B</p>
                        </div>
                        <div className='h-[20%]  rounded-b-md w-[100%] flex items-center justify-start  cursor-pointer hover:bg-white ' >
                            <img src={`https://firebasestorage.googleapis.com/v0/b/giga-chat-9416b.appspot.com/o/modelImages%2Fgemini.png?alt=media&token=2e11ca17-ba6a-4835-9721-31435c0cbf93`} alt="profile" style={{ width: "25px", height: "25px", objectFit: "cover", marginLeft: "5px", }} /> <p className='text-white ml-2 hover:bg-white hover:text-black  font-mono' >Gemini-Pro</p>
                        </div>
                    </div>
                </>}
                <div className={`flex flex-col w-[100%] h-screen justify-center items-center ${isChatWindowVisible === null ? 'hidden' : isChatWindowVisible ? 'chat-window' : 'chat-window-hidden'} `} >
                    <div className='flex justify-center items-center w-[100%] h-[85%] relative '>
                        <div className='relative flex flex-col-reverse w-[90%] h-[90%] border border-[#1e232c] rounded overflow-x-hidden overflow-y-scroll ' >
                            <div className='w-[60%] flex flex-col h-[25%] fixed top-8 right-2 ' >
                                {model.length > 0 ? <>
                                    <div className={`w-[5%] h-[15%] relative top-0 ml-[auto] flex justify-center items-center border border-white rounded-sm   `} onClick={handleDropDown} >
                                        {dropdownClicked ?
                                            <KeyboardArrowUpIcon sx={{ color: "white", cursor: "pointer", marginTop: "auto", marginBottom: "auto", backgroundColor: "black", width: "100%", height: "100%" }} />
                                            : <ArrowDropDownIcon sx={{ color: "white", cursor: "pointer", marginTop: "auto", marginBottom: "auto", backgroundColor: "black", width: "100%", height: "100%" }} />
                                        }
                                    </div>
                                </> : <></>}
                            </div>

                            {model !== "" && messages && messages.map((msg, idx) =>
                            (
                                <>
                                    <div className={`w-[700px] border-none h-[fit-content] flex mb-20 border border-white ${msg.isSender ? ' ml-auto sender' : ''} `} >
                                        {msg.isSender ? <>
                                            <div className={`w-[fit-content] h-[fit-content] font-thin text-sm mt-2 p-0 mb-2 mr-0  ${msg.isSender ? 'bg-[#3d3c3c] ml-auto rounded-s bubbleAi right ' : 'bg-[#1e232c] rounded-e bubbleAi left '}  text-white flex flex-col  `}>
                                                {msg.message}
                                            </div>
                                            <div className='rounded-full border-none w-[40px] h-[40px] mt-[auto] overflow-hidden flex justify-end ' >
                                                {dispProfilePic ? <>
                                                    <img
                                                        src={`${profilePicPath?.profilePicPath}`}
                                                        alt="profile"
                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    />
                                                </> : <>
                                                    <PersonIcon sx={{ border: "1px solid white", borderRadius: "50px", color: "white", width: "35px", height: "35px" }} />
                                                </>}
                                            </div>

                                        </> : <>
                                            <div className='border-none flex items-center justify-center w-[50px] h-[50px] overflow-hidden mt-[auto]' >
                                                <img
                                                    src={msg.model === 'openai' ? `https://firebasestorage.googleapis.com/v0/b/giga-chat-9416b.appspot.com/o/modelImages%2Fopenai.png?alt=media&token=9e6f0bd8-a12c-434a-a41d-045575fddd1b` : msg.model === 'antrophic' ? `https://firebasestorage.googleapis.com/v0/b/giga-chat-9416b.appspot.com/o/modelImages%2Fantrophic.png?alt=media&token=8720acb0-83f6-4faf-9628-cce425f1221b` : msg.model === 'meta' ? `https://firebasestorage.googleapis.com/v0/b/giga-chat-9416b.appspot.com/o/modelImages%2Fmeta.png?alt=media&token=fd3ae277-ea8c-49c4-8cff-3b6f228cd095` : msg.model === 'gemma' ? `https://firebasestorage.googleapis.com/v0/b/giga-chat-9416b.appspot.com/o/modelImages%2Fgemma.png?alt=media&token=88575525-9045-4ca8-bb0b-e152b17fd8d6` : msg.model === 'mistral' ? `https://firebasestorage.googleapis.com/v0/b/giga-chat-9416b.appspot.com/o/modelImages%2Fmistral.png?alt=media&token=a4049518-19f5-4e41-acce-89c7e598a4af` : msg.model === 'gemini' ? `https://firebasestorage.googleapis.com/v0/b/giga-chat-9416b.appspot.com/o/modelImages%2Fgemini.png?alt=media&token=2e11ca17-ba6a-4835-9721-31435c0cbf93` : null}
                                                    alt="profile"
                                                    style={{ border: "none", objectFit: "cover", backgroundColor: "black" }}
                                                />
                                            </div>
                                            <div className={`w-[fit-content]  h-[fit-content] mt-2 font-thin text-sm
                                             border-none ${msg.isSender ? 'bg-[#3d3c3c] ml-auto rounded-s bubbleAi right ' : 'bg-[#1e232c] rounded-e bubbleAi left '}  text-white p-[5%] flex flex-col font-semibold  `}>
                                                {msg.imageURL ? <img src={msg.imageURL} alt="image" style={{ width: "100%", height: "50%" }} /> : <></>}
                                                {msg.messageNumber && lastestMessage === msg.messageNumber ? <>
                                                    <p className='w-[100%] h-[50%] mt-[5%] '>
                                                        <Typewriter
                                                            options={{
                                                                strings: [msg.message],
                                                                autoStart: true,
                                                                loop: false,
                                                                delay: 5,
                                                                deleteSpeed: Infinity
                                                            }}
                                                        />
                                                    </p>
                                                </> : <>
                                                    <p className={`w-[100%] h-[50%] ${msg.imageURL ? ' mt-[5%]' : '' }  `} > {msg.message} </p>
                                                </>}

                                            </div>
                                        </>}
                                    </div>
                                </>
                            )

                            )}



                        </div>
                    </div>

                    <div className='flex justify-center items-center w-[100%] h-[15%] relative '>
                        <div className='flex flex-center justify-center items-center relative w-[90%] h-[80%] border border-[#1e232c] rounded p-[5px] ' >
                            <form onSubmit={handleChatSubmit} className='w-[100%] h-[100%]' >
                                <input type="text" className='bg-[#1e232c] w-[100%] h-[100%] text-white text-center outline-none' value={typedMessage} onChange={(e) => setTypedMessage(e.target.value)} placeholder={botTyping ? 'Bot is Typing...' : `Enter your query and hit "Enter"`} disabled={botTyping} />
                                <input type="submit" className='hidden w-[0%] h-[0%]' />
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}
