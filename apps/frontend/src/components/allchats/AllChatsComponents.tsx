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
        if (session?.status === 'authenticated') {
            setEmailCookie('email', session?.data?.user?.email, { path: '/' })
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


    let inputs = null
    let toggle_btn = null
    let main = null
    let bullets = null
    let images = null

    useEffect(() => {
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
    })

    function moveSlider(this: HTMLElement) {
        const index = parseInt(this.dataset.value as string);

        if (!isNaN(index)) {
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


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        try {

            const res = await fetch('http://localhost:4000/enterDetails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, username, phone, email, password: currentPassword, provider: cookies.provider })
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

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};

export const MainComponent: React.FC = () => {
    const [results, setResults] = useState<object>()
    const [displaySearchResults, setDisplaySearchResults] = useState<boolean>(false)
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState<User[]>([]);
    const [typedMessage, setTypedMessage] = useState<string>('')
    const [userClicked, setUserClicked] = useState<number | null>(null)
    const [emailCookie, setEmailCookie] = useCookies(['email' as string])
    const [messages, setMessages] = useState<object[]>([])
    const [isPopUpVisible, setIsPopUpVisible] = useCookies(['isPopUpVisible']);
    const [currentUser, setCurrentUser] = useCookies(['username'])
    const [profilePicPath, setProfilePicPath] = useCookies(['profilePicPath'])
    const [recievedMessage, setRecievedMessage] = useState<string>('')
    const [isChatWindowVisible, setIsChatWindowVisible] = useState<boolean | null>(null)
    const [currentUserName, setCurrentUserName] = useState<string>('')
    const [index, setIndex] = useState<number>(0)
    const [roomId, setRoomId] = useState<string>('')
    const [placeholderVal, setPlaceholderVal] = useState("Enter your message and hit 'Enter'")

    const [openAiChats, setOpenAiChats] = useState<object[]>([{ role: "system", content: "You are a helpful assistant , that responds on behalf of the user based on the past conversation . Just make a logical guess what could user might say next and just give that as an output . If the newest role is user then just provide the follow-up sentence that the user might say and if the newest role is assistant then just provide the response to it as an output" }])
    const socket = io('http://localhost:5000')

    useEffect(() => {
        if (socket) {
            if (!socket.hasListeners('receiveMessage')) {

                socket.on('receiveMessage', (data) => {
                    if (data.email !== emailCookie.email) {
                        setRecievedMessage(data.message)
                        // setOpenAiChats(])
                    }
                })
            }

            socket.on("checkRoomId", (data) => {
                console.log(data)
                const { room_Id, sender, receiver } = data;
                console.log(room_Id, sender, receiver)
                if (roomId !== room_Id) {
                    if (selectedUser) {
                        console.log(1, receiver, currentUser?.username)
                        if (receiver === currentUser?.username) {
                            console.log(2)
                            if (selectedUser.find((user) => user?.username === sender?.username)) {
                                setRoomId(room_Id)
                                socket.emit("joinRoom", room_Id);
                            } else {
                                console.log(3)
                                setRoomId(room_Id)
                                socket.emit("joinRoom", room_Id);
                                handleSearchResultClicked(sender, room_Id)
                                // handleUserClick(0)

                            }
                        }
                        // const isRoomIdPresent = selectedUser.find((user) => user.roomId == room_Id);
                        // if (isRoomIdPresent) {
                        //     setRoomId(room_Id)
                        //     socket.emit("joinRoom", room_Id);
                        // }
                    }

                }
            })
        }

        return () => { socket.off('checkRoomId'); }
    }, [socket]);
    const [count, setCount] = useState(0)
    function removeApiKey(obj, count) {
        if (count === 10) {
            return
        } else {
            console.log(count)
        }
        for (const key in obj) {
            if (typeof obj[key] === 'object') {
                removeApiKey(obj[key], count + 1);
            } else if (key === 'apiKey') {
                delete obj[key];
            }
        }

    }

    const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPEN_AI_KEY1, dangerouslyAllowBrowser: true });
    useEffect(() => {
        // removeApiKey(openai,0)
        console.log(openai)
    }, [])

    const handleAiSuggestion = async (role: string, msg: string) => {
        try {

            const completion = await openai.chat.completions.create({
                messages: [...openAiChats, { role: role, content: msg }],
                model: "gpt-3.5-turbo",
            });
            setPlaceholderVal(completion?.choices[0]?.message?.content)
        }
        catch (e) {
            try {
                const openai = new OpenAI({ apiKey: process.env.NEXT_OPEN_AI_KEY2, dangerouslyAllowBrowser: true });
                const completion = await openai.chat.completions.create({
                    messages: [...openAiChats, { role: role, content: msg }],
                    model: "gpt-3.5-turbo",
                });
                setPlaceholderVal(completion.choices[0].message.content)
            } catch (e) {
                console.log(e)
            }
        }


    }

    useEffect(() => {
        handleAiSuggestion("assistant", "Provide response for this : " + recievedMessage)
        if (recievedMessage !== '' && messages) {
            setMessages((prevMessages) => [{ message: recievedMessage, isSender: false }, ...prevMessages])
            setOpenAiChats((prevChats) => [...prevChats, { role: "assistant", content: recievedMessage }])
        } else {
            setMessages([{ message: recievedMessage, isSender: false }])
            setOpenAiChats((prevChats) => [...prevChats, { role: "assistant", content: recievedMessage }])
            // setOpenAiChats([{ role: "assistant", content: recievedMessage }])
        }
    }, [recievedMessage]);

    const fetchInitialData = async () => {
        try {
            await fetch('http://localhost:4000/getUsernames', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: emailCookie?.email })
            }).then(res => res.json()).then(data => {
                const filteredData = data?.usernames.filter((item: any) => item.email !== emailCookie.email);
                setResults(filteredData)
                const array = filteredData.map((item: any) => item.username)
                setSelectedUser(data.selectedUsers)
                setCurrentUserName(data.currentUser)
                setProfilePicPath('profilePicPath', data?.currentUser?.profilePic, { path: '/' })
                setCurrentUser('username', data.currentUser?.username, { path: '/' })
            })
        } catch (e) {
            console.log(e)
        }
    }


    useEffect(() => {
        // if (!isPopUpVisible.isPopUpVisible) {
        fetchInitialData()
        // console.log(profilePicPath)
        setIsChatWindowVisible(true);
        // }
    }, [])


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
        setSearchTerm('')
        let room_ka_ID = nanoid()
        if (room_ID) {
            setRoomId(room_ID)
        } else {
            setRoomId(room_ka_ID)
        }
        console.log(selectedUser, result, roomId)
        try {
            const res = await fetch('http://localhost:4000/addUserInSelectedUsers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: emailCookie.email, selectedUser: result, roomId: room_ID ? room_ID : room_ka_ID })
            }).then((res) => {
                if (res?.status === 200) {
                    console.log('User added to the selected users list successfully.')
                } else if (res?.status === 400) {
                    console.log('Selected user is already present in the list.')
                }

            })
        } catch (e) {
            console.log("Eerror aaya")
        }

        const isResultAlreadySelected = selectedUser?.some(
            (user) => user._id === result._id
        );
        console.log(isResultAlreadySelected, selectedUser, result)
        if (!selectedUser) {
            console.log("called heere")
            setSelectedUser([result])
        }
        else if (selectedUser?.length > 0 && !isResultAlreadySelected) {
            setSelectedUser([result, ...selectedUser])
        }
    }

    const handleUserClick = async (index: number) => {
        setHandleSelectedUserClicked(true)
        setIndex(index)
        setMessages([])
        setIsChatWindowVisible(true);
        setUserClicked(index);
        setRoomId(selectedUser[index]?.roomId)
        const res = await axios.post('http://localhost:4000/getChats', {
            currentUser: currentUser?.username,
            selectedUser: selectedUser[index]?.username,
        })
        let response = res.data
        setMessages(response.chats)
        console.log(1, response)
        if (socket) {
            socket.emit("joinRoom", response?.roomId);
            socket.emit("sendRoomId", {
                roomId: response?.roomId,
                sender: currentUser,
                receiver: selectedUser,
            });
            console.log(2)
        }

    }

    const onChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setTypedMessage('')
        setPlaceholderVal('')
        handleAiSuggestion("user", "Provide follow up :" + typedMessage)
        const res = await fetch('http://localhost:4000/addChat', {
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
        if (messages) {
            setMessages((prevMessages) => [{ message: typedMessage, isSender: true }, ...prevMessages])
            setOpenAiChats((prevChats) => [...prevChats, { role: "user", content: typedMessage }])
        } else {
            setMessages([{ message: typedMessage, isSender: true }])
            setOpenAiChats((prevChats) => [...prevChats, { role: "user", content: typedMessage }])
        }


        if (socket) {
            socket.emit("sendMessage", { message: typedMessage, room_Id: roomId, email: emailCookie.email });
        }
    }

    const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 })
    const contextMenuRef = React.useRef<HTMLDivElement>(null)


    const handleContextMenu = (e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
        e.preventDefault()
        const { pageX, pageY } = e
        setContextMenu({ show: true, x: pageX, y: pageY })
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
            const res = await fetch('http://localhost:4000/archiveUser', {
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
                }
            })
        } catch (e) {
            console.log(e)
        }
    }

    const [handleSelectedUserClicked, setHandleSelectedUserClicked] = useState<boolean>(false)

    const handleUserDelete = async () => {
        try {
            const res = await fetch('http://localhost:4000/deleteUser', {
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.keyCode === 9) {
            e.preventDefault();
            const inputField = e.currentTarget;
            setTypedMessage(inputField.placeholder);
        }
    };





    return (
        <>
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
                            src={`http://localhost:4000/getprofilePic/${selectedUser[index]?.profilePic}`}
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
                            <ForumIcon sx={{ color: "#fff", width: "20%", height: "70%",padding:"0",marginBottom: "1%" }} />
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
                                                        src={`http://localhost:4000/getprofilePic/${result?.profilePic}`}
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
                                {selectedUser && selectedUser?.map((user, idx) => (
                                    <div className='w-[98%] h-[70px] bg-[#3d3c3c] border-none cursor-pointer mb-3 rounded-sm' onContextMenu={handleContextMenu} onClick={() => handleUserClick(idx)} >
                                        <div className={`w-[100%] h-[100%] flex border-none mb-3 rounded-sm   bg-[${userClicked === idx ? '#3d3c3c' : '#1e232c'}] hover:bg-[#3d3c3c]`}>
                                            <div className='relative w-[30%] h-[100%] flex justify-center items-center border-none'>
                                                <div className='relative w-[65px] h-[65px] border border-white overflow-hidden rounded-full flex flex-center items-center justify-center' >
                                                    {user.profilePic ? <><img
                                                        src={`http://localhost:4000/getprofilePic/${user?.profilePic}`}
                                                        alt="profile"
                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    /></> : <PersonIcon sx={{ color: "white", width: "70%", height: "70%" }} />}

                                                </div>
                                            </div>
                                            <div className='relative w-[70%] h-[100%] border-none text-white rounded-e-sm '>
                                                <p className=' border-none items-center w-[100%] h-[60%]  rounded-e-2xl pt-2 ml-2 mx-auto font-bold text-lg' key={idx}>{user.username}</p>
                                                <p className="italic border-none items-center w-[100%] h-[40%]  rounded-e-2xl  ml-2 mx-auto" key={idx}>{user.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
                <div className={`flex flex-col w-[100%] h-screen justify-center items-center ${isChatWindowVisible === null ? 'hidden' : isChatWindowVisible ? 'chat-window' : 'chat-window-hidden'} `} >
                    <div className='flex justify-center items-center w-[100%] h-[85%] relative '>
                        <div className='relative flex flex-col-reverse w-[90%] h-[90%] border border-[#1e232c] rounded overflow-x-clip overflow-y-auto ' >

                            {messages && messages.length > 0 && messages.map((msg, idx) => (
                                <div className={`w-[350px] border-none h-[80px] flex mt-2 ${msg.isSender ? ' ml-auto sender' : ''} `} >
                                    {msg.isSender ? <>
                                        <div className={`w-[fit-content] h-[fit-content] font-thin text-sm mt-2 p-0 mb-2 mr-0  ${msg.isSender ? 'bg-[#3d3c3c] ml-auto rounded-s bubble right ' : 'bg-[#1e232c] rounded-e bubble left '}  text-white flex flex-col  `}>
                                            {msg.message}
                                        </div>
                                        <div className='rounded-full border-none w-[40px] h-[40px] mt-[auto] overflow-hidden flex justify-end ' >
                                            {profilePicPath.profilePicPath !== "undefined" ? <>
                                                <img
                                                    src={`http://localhost:4000/getprofilePic/${profilePicPath.profilePicPath}`}
                                                    alt="profile"
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                />
                                            </> : <>
                                                <PersonIcon sx={{ border: "1px solid white", borderRadius: "50px", color: "white", width: "35px", height: "35px" }} />
                                            </>}
                                        </div>

                                    </> : <>
                                        {handleSelectedUserClicked ? <>
                                            <div className='rounded-full border-none flex items-center justify-center w-[40px] h-[40px] overflow-hidden mt-[auto] ' >
                                                {selectedUser && selectedUser[index]?.profilePic ? <><img
                                                    src={`http://localhost:4000/getprofilePic/${selectedUser[index]?.profilePic}`}
                                                    alt="profile"
                                                    style={{ width: "100%", marginTop: "auto", height: "100%", objectFit: "cover" }}
                                                /></> : <PersonIcon sx={{ border: "1px solid white", borderRadius: "50px", color: "white", width: "35px", height: "35px" }} />
                                                }
                                            </div>
                                            <div className={`w-[fit-content] h-[fit-content] mt-2 font-thin text-sm mb-2 border-none ${msg.isSender ? 'bg-[#3d3c3c] ml-auto rounded-s bubble right ' : 'bg-[#1e232c] rounded-e bubble left '}  text-white p-[1.5%] flex font-semibold  `}>{msg.message}</div>
                                        </> : <></>}
                                    </>}

                                </div>
                            ))}


                        </div>
                    </div>

                    <div className='flex justify-center items-center w-[100%] h-[15%] relative '>
                        <div className='flex flex-center justify-center items-center relative w-[90%] h-[80%] border border-[#1e232c] rounded p-[5px] ' >
                            <form onSubmit={onChatSubmit} className='submit-chat-form' >
                                <input type="text" className='bg-[#1e232c] w-[100%] h-[100%] text-white text-center outline-none ' placeholder={placeholderVal} onKeyDown={handleKeyDown} onChange={(e) => setTypedMessage(e.target.value)} value={typedMessage} />
                                <input type="submit" className='hidden w-[0%] h-[0%]' />
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}
