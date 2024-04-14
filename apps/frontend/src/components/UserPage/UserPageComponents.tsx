"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { useCookies } from 'react-cookie'
import SendIcon from '@mui/icons-material/Send';
import './index.css'
import PersonIcon from '@mui/icons-material/Person';
import { io } from 'socket.io-client';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import OpenAI from "openai";
import ChatCompletionMessageParam  from 'openai';


function getCookieValue(cookieName: string) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(cookieName + '=')) {
            return cookie.substring(cookieName.length + 1);
        }
    }
    return null;
}

const socket = io('http://localhost:5000', {
    auth: {
        token: getCookieValue('username'),
    }
})

export const removeFromOnlineUsers = async (username: string) => {
    try {
        console.log("removeOnlineUsersCalled")
        socket.emit('remove_online', username)
        const response = await fetch('https://giga-chat-2-backend.vercel.app/removeFromOnlineUsers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username })
        })
    } catch (e) { console.log(e) }

}

interface RoomComponentProps {
    username: string,
    roomId: string
}


export const MainComponent:React.FC<RoomComponentProps> = ({ roomId, username }) => {
    const [currentUser, setCurrentUser] = useCookies(['username'])
    const [messages, setMessages] = useState<object[]>([])
    const [profilePic, setProfilePic] = useState<string | null>(null)
    const [dispStatus, setDispStatus] = useCookies(['dispStatus'])
    const [profilePicPath, setProfilePicPath] = useCookies(['profilePicPath'])
    const [recievedMessage, setRecievedMessage] = useState<string>('')
    const [emailCookie, setEmailCookie] = useCookies(['email' as string])
    const [voiceNote, setVoiceNote] = useState<any>()
    const [aiSuggestions, setAiAuggestions] = useCookies(['aiSuggestions'])



    const fetchUserChats = async () => {
        try {
            const res = await axios.post('https://giga-chat-2-backend.vercel.app/getChats', { currentUser: currentUser.username, selectedUser: username })
            setProfilePic(res.data.selectedUserPic)
            setMessages(res.data.chats)
            console.log(res.data)
        } catch (e) { console.log(e) }
    }

    useEffect(() => {
        if (socket) {
            if (!socket.hasListeners('receive_Message')) {
                socket.on('receive_Message', (data) => {
                    console.log(data, "receive wala")
                    if (data.email !== emailCookie.email) {
                        setRecievedMessage(data.message)
                    }
                })
            }

            socket.on('receive_voice_message', (data) => {
                console.log(data)
                setVoiceNote(data.audioURL)
            })
        }



        return () => {
            if (!socket.connected) {
                removeFromOnlineUsers(currentUser?.username)
            }
            console.log("removeOnlineUsersCalled")
            socket.off('check_RoomId');
        }
    }, [socket]);

    useEffect(() => {
        setMessages((prevMessages) => [{ audioURL: voiceNote, isSender: false }, ...prevMessages])
    }, [voiceNote])

    const [firstTimeLoaded, setFirstTimeLoaded] = useState<boolean>(false)

    const handleAiSuggestion = async (role: "assistant" | "user", msg: string) => {
        if (aiSuggestions.aiSuggestions) {

        try {
            var openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPEN_AI_KEY1, dangerouslyAllowBrowser: true });
            const completion = await openai.chat.completions?.create({
                messages: [...openAiChats, { role: role, content: msg } as ChatCompletionMessageParam],
                model: "gpt-3.5-turbo",
            });
            setPlaceholderVal(completion?.choices[0]?.message?.content || '')
        }
          catch (e) {
            try {
              var openai = new OpenAI({ apiKey: process.env.NEXT_OPEN_AI_KEY2, dangerouslyAllowBrowser: true });
              const completion = await openai.chat.completions.create({
                messages: [...openAiChats, { role: role, content: msg } as ChatCompletionMessageParam],
                model: "gpt-3.5-turbo",
              });
              setPlaceholderVal(completion?.choices[0]?.message?.content || '')
            } catch (e) {
              console.log(e)
            }
          }
        } else {
          setPlaceholderVal('Enter your message and hit "Enter"')
        }
      }

    useEffect(() => {
        if (firstTimeLoaded) {
            handleAiSuggestion("assistant", "Provide response for this : " + recievedMessage)
        } else {
            setFirstTimeLoaded(true)
        }
        if (recievedMessage !== '' && messages) {
            setMessages((prevMessages) => [{ message: recievedMessage, isSender: false }, ...prevMessages])
            setOpenAiChats((prevChats) => [...prevChats, { role: "assistant", content: recievedMessage }])
        } else {
            setMessages([{ message: recievedMessage, isSender: false }])
            setOpenAiChats((prevChats) => [...prevChats, { role: "assistant", content: recievedMessage }])
            // setOpenAiChats([{ role: "assistant", content: recievedMessage }])
        }
    }, [recievedMessage]);

    useEffect(() => {
        fetchUserChats()
    }, [])

    const [placeholderVal, setPlaceholderVal] = useState<string>('Enter your message...')
    const [typedMessage, setTypedMessage] = useState<string>('')
    const [openAiChats, setOpenAiChats] = useState<object[]>([{ role: "system", content: "You are a helpful assistant , that responds on behalf of the user based on the past conversation . Just make a logical guess what could user might say next and just give that as an output . If the newest role is user then just provide the follow-up sentence that the user might say and if the newest role is assistant then just provide the response to it as an output" }])

    const onChatSubmit = async () => {
        console.log('huhu')
        try {
            if (typedMessage.length > 0) {
                const res = await axios.post('https://giga-chat-2-backend.vercel.app/addChat', { message: typedMessage, room_Id: roomId, sender: currentUser.username, selectedUserName: username, email: currentUser.email })
                console.log(res.data)
                if (messages) {
                    setMessages((prevMessages) => [{ message: typedMessage, isSender: true }, ...prevMessages])
                    setOpenAiChats((prevChats) => [...prevChats, { role: "user", content: typedMessage }])
                } else {
                    setMessages([{ message: typedMessage, isSender: true }])
                    setOpenAiChats((prevChats) => [...prevChats, { role: "user", content: typedMessage }])
                }
                if (socket) {
                    socket.emit('send_Message', { message: typedMessage, room_Id: roomId, email: currentUser.email, user: currentUser.username, profilePic: profilePic })
                }
                setTypedMessage('')
            } else {
                setPlaceholderVal('Please enter a message')
            }
        } catch (e) { console.log(e) }
    }


    return (<>
        <div className='h-[94vh] p-3 w-screen text-white bg-black flex flex-col '>
            <div className='w-[100%] h-[15%] flex rounded overflow-y-auto p-2 ' >
                <div className='w-[100%] h-[100%] flex justify-center items-center rounded-md border border-[#1e232c] ' >
                    <div className='w-[30%] h-[100%] flex justify-center items-center ' >
                        <img src={profilePic && profilePic.length > 0 ? `https://giga-chat-2-backend.vercel.app/getprofilePic/${profilePic}` : ``} className='w-[50px] border border-white h-[50px] rounded-full' />
                    </div>
                    <div className='w-[70%] h-[100%] flex flex-col justify-center text-white pl-2' >
                        <h3 className='text-xl font-bold'>{username}</h3>
                        <p className='font-thin italic' >Online</p>
                    </div>
                </div>
            </div>
            <div className='w-[100%] h-[73%] flex rounded p-2  ' >
                <div className='w-[100%] h-[100%] border border-[#1e232c] rounded-md flex flex-col-reverse  overflow-y-auto ' >
                    {messages.length && messages.map((msg, index) => (
                        <>
                            <div className='w-[100%] h-[fit-content] flex  my-3 ' >

                                {msg.isSender ? <>
                                    <div className='w-[fit-content] h-[fit-content] font-thin text-xxs mt-2 p-0 mb-2 mr-0 bg-[#3d3c3c] ml-auto rounded-s bubble1 right1' >
                                        {msg.audioURL ? (
                                            <audio controls src={msg.audioURL} id={index} >
                                                <source src={msg.audioURL} />
                                                Your browser does not support the audio element.
                                            </audio>
                                        ) : (
                                            <>
                                                {msg.message.includes('http://localhost:3000/pages/room/') ? (
                                                    <>
                                                        {msg.message.split('http://localhost:3000/pages/room/')[0]}
                                                        <a href={`http://localhost:3000/pages/room/${msg.message.split('http://localhost:3000/pages/room/')[1]}`} target="_blank" rel="noopener noreferrer" className='underline'>click here</a>
                                                    </>
                                                ) : (
                                                    <>{msg.message}</>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div className='w-[35px] h-[35px] mt-auto  flex justify-center items-center overflow-hidden rounded-full  ' >
                                        {profilePicPath.profilePicPath && profilePicPath.profilePicPath.length > 0 ? <>
                                            <img
                                                src={`https://giga-chat-2-backend.vercel.app/getprofilePic/${profilePicPath.profilePicPath}`}
                                                alt="profile"
                                                style={{ width: "100%", height: "100%", objectFit: "cover", marginTop: "auto" }}
                                            />
                                        </> : <>
                                            <PersonIcon sx={{ border: "1px solid white", borderRadius: "50px", color: "white", width: "20px", height: "20px" }} />
                                        </>}
                                    </div>
                                </> : <>

                                    <div className='w-[35px] h-[35px] mt-auto flex justify-center items-center overflow-hidden rounded-full  ' >
                                        {profilePic && profilePic.length > 0 ? <>
                                            <img
                                                src={`https://giga-chat-2-backend.vercel.app/getprofilePic/${profilePic}`}
                                                alt="profile"
                                                style={{ width: "100%", height: "100%", objectFit: "cover", marginTop: "auto" }}
                                            />
                                        </> : <>
                                            <PersonIcon sx={{ border: "1px solid white", borderRadius: "50px", color: "white", width: "20px", height: "20px" }} />
                                        </>}
                                    </div>
                                    <div className='w-[fit-content] h-[fit-content] flex justify-center items-center font-thin text-xxs mt-2 p-0 mb-2 mr-0 bg-[#3d3c3c] bubble1 left1  ' >
                                        {msg.audioURL ? (
                                            <audio controls src={msg.audioURL} id={index} >
                                                <source src={msg.audioURL} />
                                                Your browser does not support the audio element.
                                            </audio>
                                        ) : (
                                            <>
                                                {msg.message.includes('http://localhost:3000/pages/room/') ? (
                                                    <>
                                                        {msg.message.split('http://localhost:3000/pages/room/')[0]}
                                                        <a href={`http://localhost:3000/pages/room/${msg.message.split('http://localhost:3000/pages/room/')[1]}`} target="_blank" rel="noopener noreferrer" className='underline'>click here</a>
                                                    </>
                                                ) : (
                                                    <>{msg.message}</>
                                                )}
                                            </>
                                        )}
                                    </div>


                                </>}
                            </div>
                        </>
                    ))}
                </div>
            </div>
            <div className='w-[100%] h-[12%] flex rounded overflow-y-auto  p-2   ' >
                <div className='w-[100%] h-[100%] flex border border-[#1e232c] rounded-md p-2 justify-center items-center ' >
                    <input type='text' className='w-[80%] h-[100%] bg-[#1e232c] text-white p-2 rounded-md text-center mr-2 ' placeholder={placeholderVal} onChange={(e) => setTypedMessage(e.target.value)} value={typedMessage} />
                    <button className='w-[20%] h-[100%] bg-[#1e232c] flex justify-center items-center text-white  rounded-md' onClick={onChatSubmit} >
                        {typedMessage.length > 0 ? <SendIcon sx={{ color: 'white', width: '60%', height: '60%' }} /> : <KeyboardVoiceIcon sx={{ color: 'white', width: '40%', height: '40%' }} />}
                    </button>
                </div>
            </div>

        </div>
    </>)
}
