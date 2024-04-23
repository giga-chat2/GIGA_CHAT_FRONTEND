// @ts-nocheck
"use client"
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react';
import './index.css'
import { useAppSelector } from '@/redux/store';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { setVisiblePopUp } from '@/redux/features/intialPopUp-slice';
import Fuse from 'fuse.js';
import PersonIcon from '@mui/icons-material/Person';
import { useCookies } from 'react-cookie'
import { io } from 'socket.io-client';
import { nanoid } from '@reduxjs/toolkit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import Drawer from 'react-modern-drawer'
import CloseIcon from '@mui/icons-material/Close';
import Swal from 'sweetalert2'
import { RefObject } from 'react';
import axios from 'axios';
import OpenAI from "openai";
import ForumIcon from '@mui/icons-material/Forum';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import SettingsVoiceIcon from '@mui/icons-material/SettingsVoice';
import StraightIcon from '@mui/icons-material/Straight';
import { useRouter } from 'next/navigation'
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import { aiImageDB } from '@/config/firebase.config';
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";

export const PopUpCover: React.FC = () => {
    const session = useSession()
    const [cookies, setCookie] = useCookies(['isPopUpVisible']);
    const [provider, setProvider] = useCookies(['provider']);
    const [emailCookie, setEmailCookie] = useCookies(['email']);
    const [visiblePopUp, setVisiblePopUp] = useState<boolean>(false)
    useEffect(() => {
        setVisiblePopUp(cookies.isPopUpVisible)
    }, [cookies.isPopUpVisible])


    useEffect(() => {
        console.log(session?.status)
        if (session?.status === 'authenticated') {
            setEmailCookie('email', session?.data?.user?.email, { path: '/' })
        }
        else if (session?.status === 'unauthenticated' && emailCookie.email === undefined  ) {
            window.location.href = '/pages/auth'
        }
    })
    return (
        <>
            {visiblePopUp ? <>
                <InitialPopUp />
            </> : <></>}
        </>
    )
}

export const InitialPopUp: React.FC = () => {
    const session = useSession()
    const usedAuthProvider: boolean = useAppSelector(state => state.authReducer.value.usedProviderAuth)
    const currentEmail: string = useAppSelector(state => state.emailReducer.value.email)
    const currentPassword: string = useAppSelector(state => state.passwordReducer.value.password)
    const [show, setShow] = useState<boolean>(false)
    const [cookies, setCookie] = useCookies(['provider']);
    const [isPopUpVisible, setIsPopUpVisible] = useCookies(['isPopUpVisible'])
    const [loading, setLoading] = useState<boolean>(false)
    const dispatch = useDispatch<AppDispatch>()
    const [emailCookie, setEmailCookie] = useCookies(['email']);




    let inputs = null
    let toggle_btn = null
    let main: any = null
    let bullets: any = null
    let images: any = null

    useEffect(() => {
        if (process.browser) {
            inputs = document.querySelectorAll(".input-field");
            toggle_btn = document.querySelectorAll(".toggle");
            main = document.querySelector("main");
            bullets = document.querySelectorAll(".bullets span");
            images = document.querySelectorAll(".image");


            inputs.forEach((inp) => {
                const inputElement = inp as HTMLInputElement;
                inputElement.addEventListener("focus", () => {
                    inputElement.classList.add("active");
                });
                inputElement.addEventListener("blur", () => {
                    if (inputElement.value !== "") return;
                    inputElement.classList.remove("active");
                });
            });

            toggle_btn.forEach((btn) => {
                btn.addEventListener("click", () => {
                    main?.classList.toggle("sign-up-mode");
                });
            });
            bullets.forEach((bullet) => {
                bullet.addEventListener("click", moveSlider);
            });
        }
    })

    function moveSlider(this: HTMLElement) {
        const index = parseInt(this.dataset.value as string);

        if (!isNaN(index)) {
            if (!process.browser) return null
            const currentImage = document.querySelector(`.img-${index}`);
            const textSlider = document.querySelector(".text-group") as HTMLElement;
            bullets.forEach((bull) => bull.classList.remove("active"));
            this.classList.add("active");
            if (currentImage) {
                images.forEach((img) => img.classList.remove("show"));
                currentImage.classList.add("show");
            }
            if (textSlider) {
                textSlider.style.transform = `translateY(${-(index - 1) * 2.2}rem)`;
            }

        }
    }

    const [name, setName] = useState<string>("")
    const [username, setUsername] = useState<string>("")
    const [phone, setPhone] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [currentUser, setCurrentUser] = useCookies(['username'])



    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setCurrentUser('username', username, { path: '/' })
        try {

            const res = await fetch('https://giga-chat-2-frontend.vercel.app/enterDetails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, username, phone, email: emailCookie.email, password: currentPassword, provider: cookies.provider })
            }).then((res) => {
                if (res?.status === 200) {
                    dispatch(setVisiblePopUp(false))


                    setIsPopUpVisible('isPopUpVisible', false, { path: '/' })
                }
            })
        } catch (e) {
            console.log(e)
        }
        setLoading(false)
    }
    useEffect(() => {
        if (currentEmail.length > 0) {
            setEmail(currentEmail)
        }
        else if (session?.status === 'authenticated') {
            setEmail(session?.data?.user?.email as string)
        }
        setShow(true)
    })


    return (
        <>
            <div className="box absolute z-20 ">
                <div className="inner-box">
                    <div className="forms-wrap">
                        <form onSubmit={handleSubmit} autoComplete="off" className="details-form">
                            <div className="logo">
                                <h4>GIGA-CHAT</h4>
                            </div>

                            <div className="heading">
                                <h2>Please enter your details</h2>
                            </div>

                            <div className="actual-form">
                                <div className="input-wrap">
                                    <input
                                        type="text"
                                        minLength={4}
                                        className="input-field"
                                        autoComplete="off"
                                        required
                                        onChange={(e) => setName(e.target.value)}
                                        value={name}
                                    />
                                    <label>Enter your name</label>
                                </div>
                                <div className="input-wrap">
                                    <input
                                        type="text"
                                        minLength={5}
                                        className="input-field"
                                        autoComplete="off"
                                        required
                                        onChange={(e) => setUsername(e.target.value)}
                                        value={username}
                                    />
                                    <label>Enter your username</label>
                                </div>
                                <div className="input-wrap">
                                    <input
                                        type="number"
                                        minLength={10}
                                        className="input-field"
                                        autoComplete="off"
                                        required
                                        onChange={(e) => setPhone(e.target.value)}
                                        value={phone}
                                    />
                                    <label>Enter your phone no.</label>
                                </div>

                                <input type="submit" value={loading ? "Submitting..." : "Submit"} className="sign-btn" />
                            </div>
                        </form>
                    </div>

                    <div className="carousel">
                        <div className="images-wrapper">
                            <img src="/images/aichat.jpg" className="image img-1 show" alt="" />
                            <img src="/images/chat.jpg" className="image img-2" alt="" />
                            <img src="/images/groupchat.jpg" className="image img-3" alt="" />
                            <img src="/images/videocall.jpg" className="image img-4" alt="" />
                        </div>

                        <div className="text-slider">
                            <div className="text-wrap">
                                <div className="text-group">
                                    <h2>AI Assistance</h2>
                                    <h2>Chatting</h2>
                                    <h2>Group Chatting</h2>
                                    <h2>Video Calling</h2>
                                </div>
                            </div>

                            <div className="bullets">
                                <span className="active" data-value="1"></span>
                                <span data-value="2" ></span>
                                <span data-value="3"></span>
                                <span data-value={4}></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}


type User = {
    username: {
        type: String,
    },
    selectedUsers: [
        {
            name: {
                type: String,
            },
            username: {
                type: String,
            },
            email: {
                type: String,
            },
            password: {
                type: String,
            },
            phoneno: {
                type: String,
            },
            provider: {
                type: String,
            },
            roomId: {
                type: String,
            },
            profilePic: {
                type: String,
            },
            createdAt: {
                type: Date
            },
            isArchived: {
                type: Boolean,
            },
            chats: [
                {
                    message: {
                        type: String,
                    },
                    isSender: {
                        type: Boolean,
                    }
                }
            ]
        }
    ]
}

interface FileCompProps {
    url: string;
}





type Event = MouseEvent | TouchEvent;

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
        if (process.browser) {
            document.addEventListener('mousedown', listener);
            document.addEventListener('touchstart', listener);
        }

        return () => {
            if (process.browser) {
                document.removeEventListener('mousedown', listener);
                document.removeEventListener('touchstart', listener);
            }
        };
    }, [ref, handler]);
};

function getCookieValue(cookieName: string) {
    if (!process.browser) return null;
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(cookieName + '=')) {
            return cookie.substring(cookieName.length + 1);
        }
    }
    return null;
}

const socket = io('https://giga-chat-socket.onrender.com', {
    auth: {
        token: getCookieValue('username'),
    }
})


export const addToOnlineUsers = async (status: boolean, username: string) => {
    if (status) {
        try {
            socket.emit('online', username)
            const response = await fetch('https://giga-chat-2-frontend.vercel.app/addToOnlineUsers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: username })
            })
        } catch (e) { console.log(e) }
    }
}

export const removeFromOnlineUsers = async (status: boolean, username: string) => {
    try {
        socket.emit('remove_online', username)
        const response = await fetch('https://giga-chat-2-frontend.vercel.app/removeFromOnlineUsers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username })
        })
    } catch (e) { console.log(e) }

}

export const MainComponent: React.FC = () => {
    const [results, setResults] = useState<object>()
    const [displaySearchResults, setDisplaySearchResults] = useState<boolean>(false)
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState<User[] | undefined>();
    const [typedMessage, setTypedMessage] = useState<string>('')
    const [userClicked, setUserClicked] = useState<number | null>(null)
    const [emailCookie, setEmailCookie] = useCookies(['email' as string])
    const [messages, setMessages] = useState<object[]>([])
    const [currentUser, setCurrentUser] = useCookies(['username'])
    const [profilePicPath, setProfilePicPath] = useCookies(['profilePicPath'])
    const [recievedMessage, setRecievedMessage] = useCookies(['recievedMessage'])
    const [isChatWindowVisible, setIsChatWindowVisible] = useState<boolean | null>(null)
    const [currentUserName, setCurrentUserName] = useState()
    const [index, setIndex] = useState<number>(0)
    const [roomId, setRoomId] = useState<string>('')
    const [roomID, setRoomID] = useCookies(['roomID'])
    const [placeholderVal, setPlaceholderVal] = useState("Enter your message and hit 'Enter'")
    const [openAiChats, setOpenAiChats] = useState<object[]>([{ role: "system", content: "You are a helpful assistant , that responds on behalf of the user based on the past conversation . Just make a logical guess what could user might say next and just give that as an output . If the newest role is user then just provide the follow-up sentence that the user might say and if the newest role is assistant then just provide the response to it as an output" }])
    const [selectedOnlineUsers, setSelectedOnlineUsers] = useState<string[]>([])
    const [handleNewComingUser, setHandleNewComingUser] = useState<object>()
    const [voiceNote, setVoiceNote] = useState<any>()
    const [aiSuggestions, setAiAuggestions] = useCookies(['aiSuggestions'])
    const [dispStatus, setDispStatus] = useCookies(['dispStatus'])
    const [mobileView, setMobileView] = useCookies(['mobileView'])
    const [currentSelectedUser, setCurrentSelectedUser] = useCookies(['currentSelectedUser'])
    const [seenPendingMessages, setSeenPendingMessages] = useState<object>({})
    const [lastestReceived, setLastestReceived] = useState<string>('')
    const [fileReceived, setFileReceived] = useState<any>()
    const [newMessage, setNewMessage] = useState<string>('')


    useEffect(() => {
        if (handleNewComingUser) {
            setSelectedUser((prevSelectedUser) => [handleNewComingUser, ...prevSelectedUser])
        }
    }, [handleNewComingUser])

    useEffect(() => {
        if (socket) {
            if (!socket.hasListeners('receive_Message')) {
                socket.on('receive_Message', (data) => {
                    console.log(data, selectedUser, getCookieValue('currentSelectedUser'))
                    if (data.receiver === currentUser?.username) {
                        console.log('receive_Message', 1)
                        if (data.sender === getCookieValue('currentSelectedUser')) {
                            setNewMessage(data.message)
                            setRecievedMessage('recievedMessage', data.message, { path: '/' })
                        }
                        else if (selectedUser && selectedUser.some(user => user.username === data.sender)) {
                            console.log(seenPendingMessages, selectedUser)
                            setLastestReceived(data.sender)
                            setSeenPendingMessages((prevSeenPendingMessages) => { return { ...prevSeenPendingMessages, [data.sender]: prevSeenPendingMessages[data.sender] ? prevSeenPendingMessages[data.sender] + 1 : 1 } })
                        }
                        else {
                            setLastestReceived(data.sender)
                            setSeenPendingMessages((prevSeenPendingMessages) => { return { ...prevSeenPendingMessages, [data.sender]: prevSeenPendingMessages[data.sender] ? prevSeenPendingMessages[data.sender] + 1 : 1 } })
                            if (selectedUser && selectedUser.length > 0) {
                                try {
                                    setSelectedUser((prevSelectedUser) => [results.find(user => user.username === data.sender), ...prevSelectedUser])
                                } catch (e) { console.log(e) }
                            } else {
                                console.log(results)
                                try {
                                    setSelectedUser([results.find(user => user.username === data.sender)])
                                } catch (e) { console.log(e) }
                            }
                        }
                    }
                })
            }
            socket.on("onlineUsers", (data) => {
                setSelectedOnlineUsers((prevOnlineUsers) => [...prevOnlineUsers, data])
            })
            socket.on("remove_online", (data) => {
                setSelectedOnlineUsers((prevOnlineUsers) => prevOnlineUsers.filter((user) => user !== data))
            })

            socket.on('is_new_user_message', (data) => {
                if (data.selectedUserName === currentUser?.username) {

                    setHandleNewComingUser(data.currentUser)
                }
            })

            socket.on('receive_voice_message', (data) => {
                if (data.receiver === currentUser?.username && data.sender === getCookieValue('currentSelectedUser')) {
                    if (data.audioURL) {
                        setVoiceNote(data.audioURL)
                    } else if (data.fileURL) {
                        setFileReceived(data.fileURL)
                    }
                }
            })

            socket.on("check_RoomId", (data) => {
                const { room_Id, sender, receiver } = data;
                if (roomId !== room_Id) {
                    if (selectedUser) {
                        if (receiver === currentUser?.username) {
                            if (selectedUser.find((user) => user?.username === sender?.username)) {
                                setRoomId(room_Id)
                                socket.emit("join_Room", room_Id);
                            } else {
                                setRoomId(room_Id)
                                socket.emit("join_Room", room_Id);
                                handleSearchResultClicked(sender, room_Id)
                            }
                        }
                    }

                }
            })
            socket.on('newOnlineUsers', (data) => {
                const { onlineUsers } = data;
                setSelectedOnlineUsers(onlineUsers)
            })
        }

        return () => {
            if (!socket.connected) {
                removeFromOnlineUsers(dispStatus.dispStatus, currentUser?.username)
            }
            socket.off('check_RoomId');
        }
    }, [socket]);

    const addPending = async (recipient: string) => {
        try {
            const res = await axios.post('https://giga-chat-2-frontend.vercel.app/addPendingMessages', { recipient: recipient, currentUser: currentUser?.username })

        } catch (e) { console.log(e) }
    }

    const [previousMessage, setPreviousMessage] = useCookies(['previousMessage' as string])
    useEffect(() => {
        console.log("got called", recievedMessage.recievedMessage)
        if (recievedMessage.recievedMessage && recievedMessage.recievedMessage !== previousMessage.previousMessage) {
            if (recievedMessage.recievedMessage !== '' && messages  ) {
                setMessages((prevMessages) => [{ message: recievedMessage.recievedMessage, isSender: false }, ...prevMessages])
                setOpenAiChats((prevChats) => [...prevChats, { role: "assistant", content: recievedMessage.recievedMessage }])
                setPreviousMessage('previousMessage', recievedMessage.recievedMessage, { path: '/' })
            } else {
                setPreviousMessage('previousMessage', recievedMessage.recievedMessage, { path: '/' })
                setMessages([{ message: recievedMessage.recievedMessage, isSender: false }])
                setOpenAiChats((prevChats) => [...prevChats, { role: "assistant", content: recievedMessage.recievedMessage }])
            }
        }
        if (firstTimeLoaded) {
            handleAiSuggestion("assistant", "Provide response in maximum 10 words for this : " + recievedMessage.recievedMessage)
        } else {
            setFirstTimeLoaded(true)
        }
    }, [newMessage]);

    const [animationTarget, setAnimationTarget] = useState(null);

    useEffect(() => {
        // Trigger animation when animationTarget changes
        if (animationTarget) {
            setTimeout(() => {
                setAnimationTarget(null); // Reset animationTarget after the animation completes
            }, 500);
        }
    }, [animationTarget]);





    useEffect(() => {
        if (messages && messages.length > 0) {
            setMessages((prevMessages) => [{ audioURL: voiceNote, isSender: false }, ...prevMessages])
        } else {
            setMessages([{ audioURL: voiceNote, isSender: false }])
        }
    }, [voiceNote])


    useEffect(() => {
        if (messages && messages.length > 0) {
            setMessages((prevMessages) => [{ fileURL: fileReceived, isSender: false }, ...prevMessages])
        } else {
            setMessages([{ fileURL: fileReceived, isSender: false }])
        }
    }, [fileReceived])
    const [count, setCount] = useState(0)
    function removeApiKey(obj, count) {
        if (count === 10) {
            return
        } else {
            return
        }
        for (const key in obj) {
            if (typeof obj[key] === 'object') {
                removeApiKey(obj[key], count + 1);
            } else if (key === 'apiKey') {
                delete obj[key];
            }
        }

    }


    const handleAiSuggestion = async (role: string, msg: string) => {
        if (aiSuggestions.aiSuggestions) {
            try {
                console.log(msg, "msg")
                var openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPEN_AI_KEY1, dangerouslyAllowBrowser: true });
                const completion = await openai.chat.completions.create({
                    messages: [...openAiChats, { role: role, content: msg }],
                    model: "gpt-3.5-turbo",
                });
                console.log(completion)
                setPlaceholderVal(completion?.choices[0]?.message?.content)
            }
            catch (e) {
                try {
                    console.log("error aaya", msg, "role", openAiChats)
                    openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPEN_AI_KEY2, dangerouslyAllowBrowser: true });
                    const completion = await openai.chat.completions.create({
                        messages: [...openAiChats, { role: role, content: msg }],
                        model: "gpt-3.5-turbo",
                    });
                    setPlaceholderVal(completion.choices[0].message.content)
                } catch (e) {
                    try {
                        openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPEN_AI_KEY3, dangerouslyAllowBrowser: true });
                        const completion = await openai.chat.completions.create({
                            messages: [...openAiChats, { role: role, content: msg }],
                            model: "gpt-3.5-turbo",
                        });
                        setPlaceholderVal(completion.choices[0].message.content)
                    } catch (e) {
                        openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPEN_AI_KEY4, dangerouslyAllowBrowser: true });
                        const completion = await openai.chat.completions.create({
                            messages: [...openAiChats, { role: role, content: msg }],
                            model: "gpt-3.5-turbo",
                        });
                        setPlaceholderVal(completion.choices[0].message.content)
                    }

                }
            }
        } else {
            setPlaceholderVal('Enter your message and hit "Enter"')
        }
    }
    const [firstTimeLoaded, setFirstTimeLoaded] = useState<boolean>(false)
    useEffect(() => {
        console.log("got called", recievedMessage.recievedMessage)
        if (recievedMessage.recievedMessage) {
            if (recievedMessage.recievedMessage !== '' && messages) {
                setMessages((prevMessages) => [{ message: recievedMessage.recievedMessage, isSender: false }, ...prevMessages])
                setOpenAiChats((prevChats) => [...prevChats, { role: "assistant", content: recievedMessage.recievedMessage }])
            } else {
                setMessages([{ message: recievedMessage.recievedMessage, isSender: false }])
                setOpenAiChats((prevChats) => [...prevChats, { role: "assistant", content: recievedMessage.recievedMessage }])
            }
        }
        if (firstTimeLoaded) {
            handleAiSuggestion("assistant", "Provide response in maximum 10 words for this : " + recievedMessage.recievedMessage)
        } else {
            setFirstTimeLoaded(true)
        }
    }, [recievedMessage.recievedMessage]);

    const fetchInitialData = async () => {
        try {
            await fetch('https://giga-chat-2-frontend.vercel.app/getUsernames', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: emailCookie?.email })
            }).then(res => res.json()).then(data => {
                console.log(data)
                setCurrentUserName(data?.currentUser)
                setAiAuggestions('aiSuggestions', data?.currentUser?.aiSuggestions, { path: '/' })
                setDispStatus('dispStatus', data.currentUser?.dispStatus, { path: '/' })
                const filteredData = data?.usernames?.filter((item: any) => item.email !== emailCookie.email);
                const selectedUsernames = data?.selectedUsers?.map((user: any) => user.username);
                const finalFilteredData = filteredData?.filter((item: any) => !selectedUsernames?.includes(item?.username));
                setResults(finalFilteredData);
                const array = filteredData?.map((item: any) => item?.username)
                setSelectedUser(data?.selectedUsers?.sort((a: any, b: any) => new Date(b?.lastChatTime).getTime() - new Date(a?.lastChatTime).getTime()));
                const updatedSeenPendingMessages: { [key: string]: number } = {}; // Add type annotation
                data?.selectedUsers?.forEach(user => {
                    if (user?.pending && user?.pending > 0) {
                        updatedSeenPendingMessages[user?.username] = user?.pending;
                    }
                });
                setSeenPendingMessages(updatedSeenPendingMessages);
                let arr = data?.selectedUsers?.sort((a, b) => new Date(b?.lastChatTime) - new Date(a?.lastChatTime))
                setSelectedOnlineUsers(data?.onlineUsers)
                if (data?.currentUser?.profilePic) {
                    setProfilePicPath('profilePicPath', data?.currentUser?.profilePic, { path: '/' })
                }
                setCurrentUser('username', data?.currentUser?.username, { path: '/' })
                if (socket) {
                    console.log("cammed")
                    socket.emit('online', currentUser?.username)
                    addToOnlineUsers(dispStatus?.dispStatus, currentUser?.username)
                }
                if (arr) {
                    handleUserClick(data.currentUser?.username, 0, arr[0]?.username)
                }
                console.log(finalFilteredData)
            })
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        fetchInitialData()
        setIsChatWindowVisible(true);
    }, [emailCookie])

    const fuse = new Fuse(results, {
        includeScore: true,
        keys: ['username'],
    });

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDisplaySearchResults(true)
        const term = e.target.value;
        setSearchTerm(term);

        if (term.trim() === '') {
            setDisplaySearchResults(false)
            setSearchResults([]);
        } else {
            try {
                const results = fuse.search(term);
                const sortedResults: any = results
                    .sort((a, b) => (a?.score ?? 0) - (b?.score ?? 0))
                    .map((result: any) => result.item);


                setSearchResults(sortedResults);
            } catch (e) {
                console.log(e)
            }
        }
    };


    const handleSearchResultClicked = async (result: object, room_ID?: string) => {

        setDisplaySearchResults(false)
        const isResultAlreadySelected = selectedUser?.some(
            (user) => user._id === result._id
        );
        if (!selectedUser) {
            setSelectedUser([result])
        }
        else if (selectedUser?.length > 0 && !isResultAlreadySelected) {
            setSelectedUser([result, ...selectedUser])
        }
        setSearchTerm('')
        let room_ka_ID = nanoid()
        if (room_ID) {
            setRoomId(room_ID)
        } else {
            setRoomId(room_ka_ID)
        }
        try {
            const res = await fetch('https://giga-chat-2-frontend.vercel.app/addUserInSelectedUsers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: emailCookie.email, selectedUser: result, roomId: room_ID ? room_ID : room_ka_ID })
            }).then((res) => {
                if (res?.status === 200) {
                    if (socket) {
                        currentUserName.roomId = room_ka_ID
                        socket.emit("new_user_message", { currentUser: currentUserName, selectedUserName: result?.username, roomId: room_ka_ID })

                    }

                } else if (res?.status === 400) {
                    return
                }

            })
        } catch (e) {
            console.log("Eerror aaya")
        }



    }
    const handleUserClick = async (currentUserKaNaam: string | null = null, index: any = null, initialSelectedUserName: any = null) => {

        setCurrentSelectedUser('currentSelectedUser', initialSelectedUserName, { path: '/' })
        setSeenPendingMessages((prevSeenPendingMessages) => { return { ...prevSeenPendingMessages, [initialSelectedUserName]: 0 } })
        setHandleSelectedUserClicked(true)
        let tempIdx
        if (index !== null) {
            setIndex(index)
            setUserClicked(index);
        } else {
            if (selectedUser) {
                setAnimationTarget(initialSelectedUserName);
                tempIdx = selectedUser.findIndex((user) => user?.username === initialSelectedUserName)
                setIndex(tempIdx)
                setUserClicked(tempIdx)
            }
        }
        setMessages([])
        setIsChatWindowVisible(true);
        if (selectedUser) {
            setRoomId(index ? selectedUser[index]?.roomId : selectedUser[tempIdx]?.roomId)
            setRoomID('roomID', index ? selectedUser[index]?.roomId : selectedUser[tempIdx]?.roomId, { path: '/' })
        }
        try {
            console.log(currentUser?.username, initialSelectedUserName)
            const res = await axios.post('https://giga-chat-2-frontend.vercel.app/getChats', {
                currentUser: currentUserKaNaam ? currentUserKaNaam : currentUser?.username,
                selectedUser: initialSelectedUserName,
            })
            let response = res.data
            setMessages(response.chats)
            setRoomId(response?.roomId)
        } catch (e) {
            console.log(e)
        }

    }

    const onChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setTypedMessage('')
        setPlaceholderVal('')

        if (messages) {
            setMessages((prevMessages) => [{ message: typedMessage, isSender: true }, ...prevMessages])
            setOpenAiChats((prevChats) => [...prevChats, { role: "user", content: typedMessage }])
        } else {
            setMessages([{ message: typedMessage, isSender: true }])
            setOpenAiChats((prevChats) => [...prevChats, { role: "user", content: typedMessage }])
        }
        handleAiSuggestion("user", "Provide folow up in maximum 10 words for this :" + typedMessage)

        const res = await fetch('https://giga-chat-2-frontend.vercel.app/addChat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: typedMessage, room_Id: roomId, email: emailCookie.email, selectedUserName: selectedUser[index]?.username })
        }).then((res) => {
            if (res?.status === 200) {
                console.log("huhu")
            }
        })



        if (socket) {
            socket.emit("send_Message", { message: typedMessage, room_Id: roomId, email: emailCookie.email, sender: currentUser.username, receiver: selectedUser[index]?.username });
        }
    }

    const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 })
    const contextMenuRef = React.useRef<HTMLDivElement>(null)


    const handleContextMenu = (e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
        e.preventDefault()
        if (contextMenu.show) {
            setContextMenu({ show: false, x: 0, y: 0 })

        } else {
            const { pageX, pageY } = e
            setContextMenu({ show: true, x: pageX - 150, y: pageY + 30 })
        }

    }

    const handleContextMenuClose = () => {
        setContextMenu({ show: false, x: 0, y: 0 })
    }

    useClickOutside(contextMenuRef, handleContextMenuClose)

    const handleHover = (e) => {
        e.currentTarget.classList.add('hovered');
    };

    const handleMouseLeave = (e) => {
        e.currentTarget.classList.remove('hovered');
    };

    const [isOpen, setIsOpen] = useState(false)

    const handleUserArchive = async () => {
        try {
            const res = await fetch('https://giga-chat-2-frontend.vercel.app/archiveUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: currentUser?.username, selectedUser: selectedUser[index]?.username })
            }).then((res) => {
                if (res?.status === 200) {
                    // user?.selectedUsers.find(user => user.username === selectedUser);
                    setIsChatWindowVisible(false);
                    const updatedSelectedUsers = selectedUser.filter((user, idx) => idx !== index)
                    setSelectedUser(updatedSelectedUsers)
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
                        title: "User Archieved Successfully!"
                    });
                    handleUserClick(null, 0, selectedUser[0]?.username)
                }
            })
        } catch (e) {
            console.log(e)
        }
    }

    const [handleSelectedUserClicked, setHandleSelectedUserClicked] = useState<boolean>(false)

    const handleUserDelete = async () => {
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
                    const res = await fetch('https://giga-chat-2-frontend.vercel.app/deleteUser', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ username: currentUser?.username, selectedUser: selectedUser[index]?.username })
                    }).then((res) => {
                        if (res?.status === 200) {
                            setMessages([])
                            // setIsChatWindowVisible(false);
                            const updatedSelectedUsers = selectedUser.filter((user, idx) => idx !== index)
                            setSelectedUser(updatedSelectedUsers)
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
                                title: "User Deleted Successfully!"
                            });
                        }
                    })
                } catch (e) {
                    console.log(e)
                }
            }
        })
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.keyCode === 9) {
            e.preventDefault();
            const inputField = e.currentTarget;
            setTypedMessage(inputField.placeholder);
        }
    };

    const [is_recording, setIsRecording] = useState(false)
    const audioChunks = React.useRef<any[]>([])
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
    async function startRec() {
        setIsRecording(true)
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorder.start()
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                audioChunks.current.push(e.data)
            }
        }
        mediaRecorder.onstop = async () => {
            setPlaceholderVal('Sending Voice Note...')
            const audioBlob = new Blob(audioChunks.current, { type: 'audio/ogg' })
            const audioFile = new File([audioBlob], 'audio.ogg', { type: 'audio/ogg' });

            const formData = new FormData();
            formData.append('audio', audioFile);
            formData.append('roomId', roomId);
            formData.append('sender', currentUser.username);
            if (selectedUser) {
                formData.append('receiver', selectedUser[index]?.username);
            }
            try {
                const response = await axios.post('https://giga-chat-2-frontend.vercel.app/uploadAudio', formData)
                const data = response.data;
                const audioURL = data.audioURL;
                setMessages((prevMessages) => [{ audioURL: audioURL, isSender: true }, ...prevMessages])
                if (socket) {
                    // socket.emit('voice_message', { audioURL: audioURL, roomId, sender: currentUser.username });
                    socket.emit('voice_message', { audioURL: audioURL, sender: currentUser.username, receiver: selectedUser[index]?.username })
                }
                setPlaceholderVal("Enter your message and hit 'Enter'")

            } catch (e) {
                console.log(e)
            }
        }
        mediaRecorderRef.current = mediaRecorder
    }
    function stopRec() {
        setIsRecording(false)
        audioChunks.current = []
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop()
        }
    }


    const router = useRouter()

    const redirectToUserPageMobile = async (index) => {
        if (socket) {
            socket.emit('join_Room', { room_Id: selectedUser[index].roomId, username: currentUser.username })
        }
        router.push(`allchats/${selectedUser[index].roomId}/${selectedUser[index].username}`)

    }
    const getFileURL = async (file: File) => {
        try {
            const uniqueFileName = `${Date.now()}_${file.name}`;
            const storageRef = ref(aiImageDB, `files/${uniqueFileName}`);

            const metadata = {
                contentType: file.type,
            };

            const snapshot = await uploadBytesResumable(storageRef, file, metadata);
            const downloadURL = await getDownloadURL(snapshot.ref);

            return downloadURL;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    const uploadFile = async (file: File) => {
        try {
            setPlaceholderVal('Sending File...')
            // const formData = new FormData();
            // formData.append('file', file);
            // formData.append('roomId', roomId);
            // formData.append('sender', currentUser.username);
            // for (var pair of formData.entries()) {
            //     console.log(pair[0] + ', ' + pair[1]);
            // }
            // if (selectedUser) {
            //     formData.append('receiver', selectedUser[index]?.username);
            // }

            // Make a POST request to the server
            console.log(1)
            const fileURL = await getFileURL(file)
            console.log(fileURL, "fileURL")

            const response = await axios.post('https://giga-chat-2-frontend.vercel.app/uploadFile', { roomId: roomId, sender: currentUser.username, receiver: selectedUser[index]?.username, fileURL: fileURL });
            // console.log(2)

            // const data = response.data;
            // const fileURL = data.fileURL;
            setMessages((prevMessages) => [{ fileURL: fileURL, isSender: true }, ...prevMessages])
            if (socket) {
                console.log(fileURL,"fileURL")
                socket.emit('voice_message', { fileURL: fileURL, sender: currentUser.username, receiver: selectedUser[index]?.username })
            }
            setPlaceholderVal("Enter your message and hit 'Enter'")
            console.log(4)



            console.log('File uploaded successfully', response.data);
        } catch (error) {
            console.error('Error uploading file', error);
        }
    };



    const fileInputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            uploadFile(file);
        }
    };

    const urlToName = (url) => {
        const parts = url.split('/');
        const lastPart = parts[parts.length - 1];
        const encodedFileName = lastPart.split('%2F')[1];
        const decodedFileName = decodeURIComponent(encodedFileName);
        
        let trimmedFileName = decodedFileName.split('.pdf')[0] + '.pdf';
        
        if (trimmedFileName.length > 14) {
            trimmedFileName = trimmedFileName.substring(0, 14) + '...';
        }
        
        return trimmedFileName;
    }
    
    return (
        <>
            {!mobileView.mobileView ? <>
                <Drawer
                    open={isOpen}
                    onClose={() => setIsOpen(false)}
                    direction='right'
                    className='drawer'
                    style={{ width: "25vw", backgroundColor: "#1e232c" }}
                >
                    <div className='absolute top-0 right-0 w-[40px] h-[30px] cursor-pointer z-50 border border-white flex justify-center items-center ' onClick={() => setIsOpen(false)} ><CloseIcon style={{ width: "80%", height: "80%", color: "white", cursor: "pointer" }} /></div>
                    <div className='w-[100%] h-[40%] relative border-b border-white flex justify-center items-center' >
                        <div className='w-[200px] h-[200px] rounded-full border border-white overflow-hidden ' >
                            {selectedUser && selectedUser[index]?.profilePic ? <><img
                                src={`${selectedUser[index]?.profilePic}`}
                                alt="profile"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            /></> : <PersonIcon sx={{ color: "white", width: "100%", height: "100%" }} />}
                        </div>
                    </div>
                    {selectedUser ? <>
                        <div className='w-[100%] h-[20%] flex flex-col justify-center items-center '>
                            <div className='w-[100%] h-[40%] flex  items-center' >
                                <p className='text-white   ml-5 ' ><strong> Name : </strong></p><p className='ml-3 font-thin text-white ' >{selectedUser[index]?.name}</p>
                            </div>
                            <div className='w-[100%] h-[40%] flex items-center' >
                                <p className='text-white  ml-5 ' ><strong> Username : </strong></p><p className='ml-3 font-thin text-white ' >{selectedUser[index]?.username}</p>
                            </div>
                        </div>
                        <div className='w-[100%] h-[20%] flex flex-col justify-center items-center' >
                            <div className='w-[100%] h-[20%] justify-center items-center border-y border-white text-center ' ><p className='text-white font-semibold ' > Get in touch</p>  </div>
                            <div className='w-[100%] h-[80%] flex flex-col justify-center items-center'>
                                <div className='w-[100%] h-[50%] flex justify-startitems-center mt-5'>
                                    <p className='ml-5 text-white' ><strong>Email : </strong></p><p className='ml-3 font-thin text-white' >{selectedUser[index]?.email} </p>
                                </div>
                                <div className='w-[100%] h-[50%] flex justify-start   items-center' >
                                    <p className='ml-5 text-white'><strong>Phone : </strong></p><p className='ml-3 font-thin text-white' >{selectedUser[index]?.phoneno} </p>
                                </div>
                            </div>
                        </div>
                        <div className='w-[100%] h-[20%] flex flex-col justify-center items-center border-t border-white ' >
                            <div className='w-[100%] h-[50%] flex justify-start items-center' >
                                <p className='ml-5 text-white'><strong>Joined GIGA-CHAT on : </strong></p><p className='ml-3 font-thin text-white' >{new Date(selectedUser[index]?.createdAt).getDate()}/{new Date(selectedUser[index]?.createdAt).getMonth() + 1}/{new Date(selectedUser[index]?.createdAt).getFullYear()} </p>
                            </div>
                        </div>
                    </> : <></>}

                </Drawer>
                {contextMenu.show && <div className={`absolute z-50 bg-black border border-white w-[200px] h-[150px] flex flex-col justify-center items-center rounded-md`} ref={contextMenuRef} onClick={handleContextMenuClose} style={{ top: contextMenu.y, left: contextMenu.x }} >
                    <div className={`w-[100%] h-[33%] flex  justify-start cursor-pointer items-center border-b border-white text-white `} onMouseEnter={handleHover} onMouseLeave={handleMouseLeave} onClick={() => setIsOpen(true)} >
                        <PersonRoundedIcon sx={{ color: "white", width: "20%", height: "50%" }} className='icon' />
                        <p className='ml-3 text'>View Profile</p>
                    </div>
                    <div className={`w-[100%] h-[34%] flex justify-start cursor-pointer items-center border-white text-white `} onMouseEnter={handleHover} onMouseLeave={handleMouseLeave} onClick={handleUserDelete} >
                        <DeleteIcon sx={{ color: "white", width: "20%", height: "50%" }} className='icon' />
                        <p className='ml-3 text' >Delete User</p>
                    </div>
                    <div className={`w-[100%] h-[33%] flex  justify-start cursor-pointer items-center border-t border-white text-white `} onMouseEnter={handleHover} onMouseLeave={handleMouseLeave} onClick={handleUserArchive} >
                        <ArchiveRoundedIcon sx={{ color: "white", width: "20%", height: "50%" }} className='icon' />
                        <p className='ml-3 text'>Archive User</p>
                    </div>

                </div>}
                <div className='w-[85vw] h-screen flex flex-row overflow-x-hidden overflow-y-hidden'>
                    <div className='w-[20vw] min-w-[20vw] h-[100%] relative '>
                        <div className='w-[100%] h-[90%] relative'>
                            <div className='w-[100%] h-[7%] mt-6 flex justify-center items-center  p-1'>
                                <ForumIcon sx={{ color: "#fff", width: "20%", height: "70%", padding: "0", marginBottom: "1%" }} />
                                <p className='w-[100%] h-[90%] text-xl font-semibold text-white ' >All Chats</p>
                            </div>
                            <div className='w-[100%] h-[7%] flex justify-center items-center p-1'>
                                <input
                                    type="text"
                                    placeholder='Search your contact...'
                                    className='w-[100%] h-[100%] text-center rounded bg-[#1e232c] text-white border border-none focus:border-none outline-none '
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </div>
                            <div className='w-[100%]  h-[100%] overflow-y-scroll searchResults '>
                                {displaySearchResults ? <>
                                    <div className=' flex flex-col items-center w-[100%] h-[fit-content]  border-b border-white relative z-10'>
                                        {searchResults.length > 0 && searchResults.map((result, index) => (
                                            <div className='w-[98%] h-[70px] flex border-none mb-3 rounded-sm cursor-pointer  bg-[#1e232c] hover:bg-[#3d3c3c] ' onClick={() => handleSearchResultClicked(result)} >
                                                <div className='relative w-[30%] h-[100%] flex justify-center items-center border-none'>
                                                    <div className='relative w-[65px] h-[65px] border border-white overflow-hidden rounded-full flex flex-center items-center justify-center' >
                                                        {result?.profilePic ? <><img
                                                            src={`${result?.profilePic}`}
                                                            alt="profile"
                                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                        /></> : <PersonIcon sx={{ color: "white", width: "70%", height: "70%" }} />}

                                                    </div>
                                                </div>
                                                <div className='relative w-[70%] h-[100%] border-none text-white rounded-e-sm '>
                                                    <p className=' border-none items-center w-[100%] h-[60%]  rounded-e-2xl pt-2 ml-2 mx-auto font-bold text-lg' key={index}>{result.username}</p>
                                                    <p className="italic border-none items-center w-[100%] h-[40%]  rounded-e-2xl  ml-2 mx-auto" key={index}>{result.name}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </> : <>

                                </>}
                                <div className='flex flex-col items-center relative z-10 mt-1 h-[95%] overflow-y-scroll' >
                                    {selectedUser && selectedUser.length > 0 ? selectedUser?.map((user, idx) => (
                                        <div className={`w-[98%] h-[70px] bg-[#3d3c3c] border-none cursor-pointer user-list-item  mb-3 rounded-sm ${animationTarget === user.username ? 'move-up-animation' : ''} `} onContextMenu={handleContextMenu} onClick={() => handleUserClick(null, idx, user?.username)} >
                                            <div className={`w-[100%] h-[100%] flex border-none mb-3 rounded-sm   bg-[${userClicked === idx ? '#3d3c3c' : '#1e232c'}] hover:bg-[#3d3c3c]`}>
                                                <div className='relative w-[30%] h-[100%] flex justify-center items-center border-none'>
                                                    <div className='relative w-[65px] h-[65px] border border-white overflow-hidden rounded-full flex flex-center items-center justify-center' >
                                                        {user?.profilePic ? <><img
                                                            src={`${user?.profilePic}`}
                                                            alt="profile"
                                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                        /></> : <PersonIcon sx={{ color: "white", width: "70%", height: "70%" }} />}

                                                    </div>
                                                </div>
                                                <div className='relative w-[50%] h-[100%] border-none text-white rounded-e-sm '>
                                                    <p className=' border-none items-center w-[100%] h-[60%]  rounded-e-2xl pt-2 ml-2 mx-auto font-bold text-lg' key={idx}>{user?.username}</p>
                                                    <p className="italic border-none items-center w-[100%] h-[40%]  rounded-e-2xl  ml-2 mx-auto" key={idx}>{user?.name}</p>
                                                </div>
                                                <div className='relative w-[20%] h-[100%] flex justify-center items-center text-white rounded-e-sm '>
                                                    {seenPendingMessages[user?.username] && seenPendingMessages[user?.username] > 0 ? <>
                                                        <div className='w-[50%] h-[100%]  flex justify-center items-center ' ><p className='w-[20px] h-[20px] rounded-full text-[#3d3c3c] bg-white font-semibold  flex justify-center items-center ' >{seenPendingMessages[user?.username]}</p></div>
                                                    </> : <>
                                                        <div className={`w-[10px] h-[10px] rounded-full ${selectedOnlineUsers.includes(user?.username) ? 'bg-green-300' : 'bg-red-300'} `} ></div>
                                                    </>}
                                                </div>
                                            </div>
                                        </div>
                                    )) : <>
                                        <div className='w-[80%] flex justify-center items-center text-white h-[20%] clickHereAnimation1 ' >
                                            <StraightIcon sx={{ color: "white", width: "30%", height: "80%" }} /> Click here to search your contacts
                                        </div>
                                    </>}
                                </div>
                            </div>

                        </div>
                    </div>
                    {selectedUser && selectedUser.length > 0 ?
                        <>
                            <div className={`flex flex-col w-[100%] h-screen justify-center items-center ${isChatWindowVisible === null ? 'hidden' : isChatWindowVisible ? 'chat-window' : 'chat-window-hidden'} `} >
                                <div className='flex flex-col justify-center items-center w-[100%] h-[85%] relative'>
                                    <div className='flex justify-center items-center w-[100%] h-[15%]  ' >
                                        <div className=' flex w-[90%] h-[80%] border border-[#1e232c] rounded ' >
                                            <div className='w-[10%] h-[100%]  flex justify-center items-center ' >
                                                <div className='w-[50px] h-[50px] rounded-full border border-white overflow-hidden ' >
                                                    {selectedUser[index]?.profilePic ? <>
                                                        <img
                                                            src={`${selectedUser[index]?.profilePic}`}
                                                            alt="profile"
                                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                        />
                                                    </> : <>
                                                        <PersonIcon sx={{ color: "white", width: "100%", height: "100%" }} />
                                                    </>}
                                                </div>
                                            </div>
                                            <div className='w-[15%] h-[100%]  flex flex-col justify-center items-center ' >
                                                <div className='w-[100%] h-[50%] flex justify-center items-center text-center ' >
                                                    <p className='w-[100%] h-[100%] flex justify-start items-center text-center text-white font-bold text-xl mt-3 ' >{selectedUser[index]?.username}</p>
                                                </div>
                                                <div className='w-[100%] h-[50%] flex justify-center items-center text-center ' >
                                                    <p className='w-[100%] h-[100%] flex justify-start items-center text-center  text-white font-thin text-sm italic ' >
                                                        {selectedOnlineUsers.includes(selectedUser[index]?.username) ? 'Online' : 'Offline'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='w-[10%] flex justify-center items-center h-[100%]  ml-auto ' >
                                                <MoreVertIcon sx={{ padding: "0px", width: "30%", cursor: "pointer", height: "90%", color: "white" }} onClick={handleContextMenu} />
                                            </div>

                                        </div>
                                    </div>
                                    <div className='relative flex flex-col-reverse w-[90%] h-[85%] border border-[#1e232c] rounded overflow-x-clip overflow-y-auto ' >

                                        {messages && messages.length > 0 && messages.map((msg, idx) => (
                                            <div key={idx} className={`w-[450px] mb-20 border-none h-[150px] flex mt-2 ${msg.isSender ? 'ml-auto sender' : ''}`}>
                                                {msg.isSender ? (
                                                    <>
                                                        <div className={`w-[fit-content] h-[fit-content] font-thin text-sm mt-2 p-0 mb-2 mr-0 ${msg.isSender ? 'bg-[#3d3c3c] ml-auto rounded-s bubble1 right1' : 'bg-[#1e232c] rounded-e bubble1 left1'} text-white flex flex-col`}>
                                                            {msg.audioURL ? (
                                                                <audio controls src={msg.audioURL} id={idx} >
                                                                    <source src={msg.audioURL} />
                                                                    Your browser does not support the audio element.
                                                                </audio>
                                                            ) : msg.fileURL ? (
                                                                <div className='w-[200px] h-[50px] flex cursor-pointer ' onClick={() => window.open(msg.fileURL, '_blank')} >
                                                                    <div className='w-[20%] h-[100%] flex justify-center items-center ' >
                                                                        <FileOpenIcon sx={{ width: "80%", height: "80%", padding: "0px", color: "white" }} />
                                                                    </div>
                                                                    <div className='w-[80%] h-[100%] flex justify-start items-center text-sm p-2 ' >
                                                                        {urlToName(msg.fileURL)}
                                                                    </div>
                                                                </div>

                                                            ) : (
                                                                <>
                                                                    {msg?.message?.includes('https://www.giga-chat.tech/pages/room/') ? (
                                                                        <>
                                                                            {msg.message.split('https://www.giga-chat.tech/pages/room/')[0]}
                                                                            <a href={`https://www.giga-chat.tech/pages/room/${msg.message.split('https://www.giga-chat.tech/pages/room/')[1]}`} target="_blank" rel="noopener noreferrer" className='underline'>click here</a>
                                                                        </>
                                                                    ) : (
                                                                        <>{msg.message}</>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className='rounded-full border-none w-[40px] h-[40px] mt-[auto] overflow-hidden flex justify-end'>
                                                            {profilePicPath.profilePicPath !== "undefined" ? (
                                                                <img
                                                                    src={`${profilePicPath.profilePicPath}`}
                                                                    alt="profile"
                                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                                />
                                                            ) : (
                                                                <PersonIcon sx={{ border: "1px solid white", borderRadius: "50px", color: "white", width: "35px", height: "35px" }} />
                                                            )}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        {handleSelectedUserClicked ? (
                                                            <>
                                                                <div className='rounded-full border-none flex items-center justify-center w-[40px] h-[40px] overflow-hidden mt-[auto]'>
                                                                    {selectedUser && selectedUser[index]?.profilePic ? (
                                                                        <img
                                                                            src={`${selectedUser[index]?.profilePic}`}
                                                                            alt="profile"
                                                                            style={{ width: "100%", marginTop: "auto", height: "100%", objectFit: "cover" }}
                                                                        />
                                                                    ) : (
                                                                        <PersonIcon sx={{ border: "1px solid white", borderRadius: "50px", color: "white", width: "35px", height: "35px" }} />
                                                                    )}
                                                                </div>
                                                                <div className={`w-[fit-content] h-[fit-content] mt-2 font-thin text-sm mb-2 border-none ${msg.isSender ? 'bg-[#3d3c3c] ml-auto rounded-s bubble1 right1' : 'bg-[#1e232c] rounded-e bubble1 left1'} text-white p-[1.5%] flex font-semibold`}>
                                                                    {msg.audioURL ? (
                                                                        <audio src={msg.audioURL} controls>
                                                                            <source src={msg.audioURL} type="audio/wav" />
                                                                            Your browser does not support the audio element.
                                                                        </audio>
                                                                    ) : msg.fileURL ? (
                                                                        <div className='w-[200px] h-[50px] flex cursor-pointer ' onClick={() => window.open(msg.fileURL, '_blank')} >
                                                                            <div className='w-[20%] h-[100%] flex justify-center items-center ' >
                                                                                <FileOpenIcon sx={{ width: "80%", height: "80%", padding: "0px", color: "white" }} />
                                                                            </div>
                                                                            <div className='w-[80%] h-[100%] flex justify-start items-center text-sm p-2 ' >
                                                                                {urlToName(msg.fileURL)}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            {msg?.message?.includes('https://www.giga-chat.tech/pages/room/') ? (
                                                                                <>
                                                                                    {msg.message.split('https://www.giga-chat.tech/pages/room/')[0]}
                                                                                    <a href={`https://www.giga-chat.tech/pages/room/${msg.message.split('https://www.giga-chat.tech/pages/room/')[1]}`} target="_blank" rel="noopener noreferrer" className='underline'>click here</a>
                                                                                </>
                                                                            ) : (
                                                                                <>{msg.message}</>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <></>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        ))}




                                    </div>
                                </div>
                               <div className='flex justify-center items-center w-[90%] h-[15%] relative '>

                                    <div className='flex flex-center justify-center items-center relative w-[100%] h-[80%] border border-[#1e232c] rounded-full p-[5px] ' >
                                        <form onSubmit={onChatSubmit} className='submit-chat-form' >
                                            <input type="text" className='bg-[#1e232c] w-[100%] h-[100%] text-white text-center outline-none border rounded-full ' placeholder={placeholderVal} onKeyDown={handleKeyDown} onChange={(e) => setTypedMessage(e.target.value)} value={typedMessage} />
                                            <input type="submit" className='hidden w-[0%] h-[0%]' />
                                        </form>
                                    </div>
                                    <div className='w-[15%] h-[100%] flex justify-center items-center' >
                                        <div className='w-[100px] h-[100px] border border-[#1e232c] flex justify-center items-center rounded-full ' >
                                            <div className='bg-[#1e232c] flex justify-center items-center w-[90%] h-[90%] cursor-pointer text-white text-center border rounded-full '   >
                                                <input type="file" className='w-[10%] h-[100%] opacity-0 cursor-pointer absolute ' onChange={fileInputHandler} />
                                                <AttachFileIcon sx={{ color: 'white', width: '30%', height: '30%' }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='w-[15%] h-[100%] flex justify-center items-center' >
                                        <div className='w-[100px] h-[100px] border border-[#1e232c] flex justify-center items-center rounded-full ' >
                                            <div className='bg-[#1e232c] flex justify-center items-center w-[90%] h-[90%] cursor-pointer border rounded-full text-white text-center' onMouseDown={startRec} onMouseUp={stopRec}>
                                                {is_recording ? <SettingsVoiceIcon sx={{ color: 'white', width: '25%', height: '25%' }} /> : <KeyboardVoiceIcon sx={{ color: 'white', width: '40%', height: '40%' }} />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </> : <>
                            <div className='flex flex-col w-[100%] h-screen  justify-center items-center ' >
                                <img src="/images/no_users_found.png" className='w-[70%] h-[85%]  ' alt="" />

                            </div>
                        </>}

                </div>
            </> : <>
                <div className='w-[100%] h-[90%] flex flex-col justify-center items-center ' >
                    <div className='w-[100%] h-[5%] flex justify-center items-center ' >
                        <ForumIcon sx={{ color: "#fff", width: "20%", height: "100%", marginBottom: 'auto', padding: "0" }} />
                        <p className='w-[100%] h-[90%] text-xl font-semibold text-white ' >All Chats</p>
                    </div>
                    <div className='w-[100%] h-[10%] p-3  flex justify-center items-center ' >
                        <input
                            type="text"
                            placeholder='Search your contact...'
                            className='w-[100%] h-[100%] text-center rounded bg-[#1e232c] text-white border border-none focus:border-none outline-none '
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className='w-[100%] h-[85%] p-3 flex flex-col justify-start items-center overflow-y-scroll  ' >
                        {displaySearchResults ? <>
                            <div className=' flex flex-col items-center w-[100%] h-[fit-content]  border-b border-white relative z-10'>
                                {searchResults.length > 0 && searchResults.map((result, index) => (
                                    <div className='w-[98%] h-[70px] flex border-none mb-3 rounded-sm cursor-pointer  bg-[#1e232c] hover:bg-[#3d3c3c] ' onClick={() => handleSearchResultClicked(result)} >
                                        <div className='relative w-[30%] h-[100%] flex justify-center items-center border-none'>
                                            <div className='relative w-[65px] h-[65px] border border-white overflow-hidden rounded-full flex flex-center items-center justify-center' >
                                                {result?.profilePic ? <><img
                                                    src={`https://giga-chat-2-frontend.vercel.app/getprofilePic/${result?.profilePic}`}
                                                    alt="profile"
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                /></> : <PersonIcon sx={{ color: "white", width: "70%", height: "70%" }} />}

                                            </div>
                                        </div>
                                        <div className='relative w-[70%] h-[100%] border-none text-white rounded-e-sm '>
                                            <p className=' border-none items-center w-[100%] h-[60%]  rounded-e-2xl pt-2 ml-2 mx-auto font-bold text-lg' key={index}>{result.username}</p>
                                            <p className="italic border-none items-center w-[100%] h-[40%]  rounded-e-2xl  ml-2 mx-auto" key={index}>{result.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </> : <></>}
                        <div className='flex flex-col items-center w-[100%] relative z-10 mt-1 h-[95%] overflow-y-scroll' >
                            {selectedUser && selectedUser.length > 0 ? selectedUser?.map((user, idx) => (
                                <div className='w-[98%] h-[70px] bg-[#3d3c3c] border-none cursor-pointer mb-3 rounded-sm' onContextMenu={handleContextMenu} onClick={() => redirectToUserPageMobile(idx)} >
                                    <div className={`w-[100%] h-[100%] flex border-none mb-3 rounded-sm   bg-[${userClicked === idx ? '#3d3c3c' : '#1e232c'}] hover:bg-[#3d3c3c]`}>
                                        <div className='relative w-[30%] h-[100%] flex justify-center items-center border-none'>
                                            <div className='relative w-[65px] h-[65px] border border-white overflow-hidden rounded-full flex flex-center items-center justify-center' >
                                                {user?.profilePic ? <><img
                                                    src={`https://giga-chat-2-frontend.vercel.app/getprofilePic/${user?.profilePic}`}
                                                    alt="profile"
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                /></> : <PersonIcon sx={{ color: "white", width: "70%", height: "70%" }} />}

                                            </div>
                                        </div>
                                        <div className='relative w-[50%] h-[100%] border-none text-white rounded-e-sm '>
                                            <p className=' border-none items-center w-[100%] h-[60%]  rounded-e-2xl pt-2 ml-2 mx-auto font-bold text-lg' key={idx}>{user?.username}</p>
                                            <p className="italic border-none items-center w-[100%] h-[40%]  rounded-e-2xl  ml-2 mx-auto" key={idx}>{user?.name}</p>
                                        </div>
                                        <div className='relative w-[20%] h-[100%] flex justify-center items-center text-white rounded-e-sm '>
                                            <div className={`w-[10px] h-[10px] rounded-full ${selectedOnlineUsers.includes(user?.username) ? 'bg-green-300' : 'bg-red-300'} `} ></div>
                                        </div>
                                    </div>
                                </div>
                            )) : <>
                                <div className='w-[80%] flex justify-center items-center text-white h-[20%] clickHereAnimation1 ' >
                                    <StraightIcon sx={{ color: "white", width: "30%", height: "80%" }} /> Click here to search your contacts
                                </div>
                            </>}
                        </div>


                    </div>

                </div>
            </>}
        </>

    )
}
