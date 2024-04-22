// @ts-nocheck
"use client"
import React, { useEffect, useState } from 'react'
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
import './index.css'
import axios from 'axios'
import Swal from 'sweetalert2'
import ArchiveIcon from '@mui/icons-material/Archive';
import { useRouter } from 'next/navigation';
import SettingsVoiceIcon from '@mui/icons-material/SettingsVoice';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import OpenAI from "openai";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useSession } from 'next-auth/react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import FileOpenIcon from '@mui/icons-material/FileOpen';

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

import { RefObject } from 'react';

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

const socket = io('https://giga-chat-socket.onrender.com', {
    auth: {
        token: getCookieValue('username'),
    }
})
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

export const MainComponent: React.FC = () => {
    const [results, setResults] = useState<object>()
    const [displaySearchResults, setDisplaySearchResults] = useState<boolean>(false)
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState<object[]>([]);
    const [typedMessage, setTypedMessage] = useState<string>('')
    const [userClicked, setUserClicked] = useState<number | null>(null)
    const [emailCookie, setEmailCookie] = useCookies(['email' as string])
    const [messages, setMessages] = useState<object[]>([])
    const [currentUser, setCurrentUser] = useCookies(['username'])
    const [profilePicPath, setProfilePicPath] = useCookies(['profilePicPath'])
    const [recievedMessage, setRecievedMessage] = useCookies(['recievedMessage'])
    const [isChatWindowVisible, setIsChatWindowVisible] = useState<boolean | null>(null)
    const [index, setIndex] = useState<number>(0)
    const [roomId, setRoomId] = useState<string>('')
    const [displayNoUsersFoundImg, setDisplayNoUsersFoundImg] = useState<boolean>(false)
    const [placeholderVal, setPlaceholderVal] = useState("Enter your message and hit 'Enter'")
    const [openAiChats, setOpenAiChats] = useState<object[]>([{ role: "system", content: "You are a helpful assistant , that tells the receiver what should be his next response based on the past conversations , provide output under maximum 10 words " }, { role: "user", content: "Hello, how are you?" }])
    const [voiceNote, setVoiceNote] = useState<any>()
    const [currentSelectedUser, setCurrentSelectedUser] = useCookies(['currentSelectedUser'])
    const [aiSuggestions, setAiAuggestions] = useCookies(['aiSuggestions'])
    const [fileReceived, setFileReceived] = useState<any>()


    const session = useSession()

    useEffect(() => {
        if (session?.status === 'authenticated') {
            setEmailCookie('email', session?.data?.user?.email, { path: '/' })
        }
        else if (session?.status === 'unauthenticated'  && emailCookie.email === undefined   ) {
            window.location.href = '/pages/auth'
        }
    }, [])


    useEffect(() => {
        if (socket) {
            if (!socket.hasListeners('receive_Message')) {
                socket.on('receive_Message', (data) => {
                    console.log(data, selectedUser, getCookieValue('currentSelectedUser'))
                    if (data.receiver === currentUser?.username) {
                        console.log('receive_Message', 1)
                        if (data.sender === getCookieValue('currentSelectedUser')) {
                            setRecievedMessage('recievedMessage', data.message, { path: '/' })
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
            socket.on('newOnlineUsers', (data) => {
                const { onlineUsers } = data;
                setSelectedOnlineUsers(onlineUsers)
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
                                handleSearchResultClicked(sender)
                            }
                        }
                    }

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
        }

        // return () => { socket.off('check_RoomId'); }
    }, [socket]);

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

    var openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPEN_AI_KEY1, dangerouslyAllowBrowser: true });

    const handleAiSuggestion = async (role: string, msg: string) => {
        if (aiSuggestions.aiSuggestions) {
            try {

                const completion = await openai.chat.completions.create({
                    messages: [...openAiChats, { role: role, content: msg }],
                    model: "gpt-3.5-turbo",
                });
                setPlaceholderVal(completion?.choices[0]?.message?.content)
            }
            catch (e) {
                try {
                    openai = new OpenAI({ apiKey: process.env.NEXT_OPEN_AI_KEY2, dangerouslyAllowBrowser: true });
                    const completion = await openai.chat.completions.create({
                        messages: [...openAiChats, { role: role, content: msg }],
                        model: "gpt-3.5-turbo",
                    });
                    setPlaceholderVal(completion.choices[0].message.content)
                } catch (e) {
                    console.log(e)
                }
            }
        } else {
            setPlaceholderVal('Enter your message and hit "Enter"')
        }
    }
    const [firstTimeLoaded, setFirstTimeLoaded] = useState<boolean>(false)
    useEffect(() => {
        console.log("got called", recievedMessage.recievedMessage)
        if (firstTimeLoaded) {
            handleAiSuggestion("assistant", "Provide response in maximum 10 words for this : " + recievedMessage.recievedMessage)
        } else {
            setFirstTimeLoaded(true)
        }
        if (recievedMessage.recievedMessage !== '' && messages) {
            setMessages((prevMessages) => [{ message: recievedMessage.recievedMessage, isSender: false }, ...prevMessages])
            setOpenAiChats((prevChats) => [...prevChats, { role: "assistant", content: recievedMessage.recievedMessage }])
        } else {
            setMessages([{ message: recievedMessage.recievedMessage, isSender: false }])
            setOpenAiChats((prevChats) => [...prevChats, { role: "assistant", content: recievedMessage.recievedMessage }])
        }
    }, [recievedMessage.recievedMessage]);

    const fetchInitialData = async () => {
        try {
            await fetch('https://giga-chat-2-frontend.vercel.app/getArchivedUsers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: currentUser?.username })
            }).then(res => res.json()).then(data => {
                // const filteredData = data?.usernames.filter((item: any) => item.email !== emailCookie.email);
                // setResults(filteredData)
                // const array = filteredData.map((item: any) => item.username)
                // setSelectedUser(data.selectedUsers)
                // setCurrentUserName(data.currentUser)
                // setProfilePicPath('profilePicPath', data?.currentUser?.profilePic, { path: '/' })
                // setCurrentUser('username', data.currentUser?.username, { path: '/' })
                setSelectedUser(data.archivedUsers)
                handleUserClick(0, data.archivedUsers[0]?.username, data.archivedUsers[0]?.roomId)
                console.log(data.archivedUsers)
                setSelectedOnlineUsers(data.onlineUsers)
            })
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        fetchInitialData()
        setIsChatWindowVisible(true);

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
            const results = fuse.search(term);
            const sortedResults: any = results
                .sort((a, b) => (a?.score ?? 0) - (b?.score ?? 0))
                .map((result: any) => result.item);


            setSearchResults(sortedResults);
        }
    };

    const handleSearchResultClicked = (result: object) => {
        setDisplaySearchResults(false)
        setSearchTerm('')
        setRoomId(nanoid())
        try {
            const res = fetch('https://giga-chat-2-frontend.vercel.app/addUserInSelectedUsers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: emailCookie.email, selectedUser: result, roomId: roomId })
            }).then((res) => {
                if (res?.status === 200) {
                    console.log('User added to the selected users list successfully.')
                } else if (res?.status === 400) {
                    console.log('Selected user is already present in the list.')
                }

            })
        } catch (e) {
            console.log(e)
        }

        const isResultAlreadySelected = selectedUser?.some(
            (user) => user._id === result._id
        );
        console.log(isResultAlreadySelected, selectedUser, result)
        if (selectedUser?.length === 0 && !isResultAlreadySelected) {
            setSelectedUser([result])
        }
        else if (selectedUser?.length > 0 && !isResultAlreadySelected) {
            setSelectedUser([result, ...selectedUser])
        }
    }

    const handleUserClick = async (index: number, initialSelectedUserName: any = null, room_ka_ID: any = null) => {
        setCurrentSelectedUser('currentSelectedUser', initialSelectedUserName, { path: '/' })
        setIndex(index)
        setMessages([])
        setUserClicked(index);
        setRoomId(room_ka_ID)

        try {
            const res = await axios.post('https://giga-chat-2-frontend.vercel.app/getChats', {
                currentUser: currentUser?.username,
                selectedUser: initialSelectedUserName,
            }).then((res) => {
                if (res?.status === 200) {
                    setMessages(res.data.chats)
                }
            })
        } catch (e) {
            console.log(e)
        }
        // if (socket) {
        //     // if (!isChatWindowVisible) {
        //     socket.emit("join_Room", selectedUser[index]?.roomId);
        //     socket.emit("send_RoomId", {
        //         roomId: selectedUser[index]?.roomId,
        //         sender: currentUser,
        //         receiver: selectedUser,
        //     });
        //     // }
        // }

    }

    const onChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const res = await fetch('https://giga-chat-2-frontend.vercel.app/addChat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: typedMessage, room_Id: roomId, email: emailCookie.email, selectedUserName: selectedUser[index]?.username })
        }).then((res) => {
            if (res?.status === 200) {
                console.log('Message sent successfully.')
            }
        })
        handleAiSuggestion("user", "Provide output in maximum 10 words for the follow up :" + typedMessage)
        setMessages((prevMessages) => [{ message: typedMessage, isSender: true }, ...prevMessages])
        setOpenAiChats((prevChats) => [{ role: "sender", content: typedMessage }, ...prevChats])
        console.log("before openai", openAiChats)
        if (socket) {
            setTypedMessage('')
            socket.emit("send_Message", { message: typedMessage, room_Id: roomId, email: emailCookie.email, sender: currentUser.username, receiver: selectedUser[index]?.username });

        }
    }

    const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 })
    const contextMenuRef = React.useRef<HTMLDivElement>(null)


    const handleContextMenu = (e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
        e.preventDefault()
        const { pageX, pageY } = e
        setContextMenu({ show: true, x: pageX - 150, y: pageY + 30 })
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
    const { push } = useRouter();


    const handleUserArchive = async () => {
        try {
            const res = await fetch('https://giga-chat-2-frontend.vercel.app/unArchiveUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: currentUser?.username, selectedUser: selectedUser[index]?.username })
            }).then((res) => {
                if (res?.status === 200) {
                    // setIsChatWindowVisible(false);
                    const updatedSelectedUsers = selectedUser.filter((user, idx) => idx !== index)
                    handleUserClick(0, updatedSelectedUsers[0]?.username, updatedSelectedUsers[0]?.roomId)
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
                        title: "User UnArchieved Successfully!"
                    });
                    if (updatedSelectedUsers.length === 0) {
                        push('/pages/allchats')
                    } else {
                        setSelectedUser(updatedSelectedUsers)
                    }
                }
            })
        } catch (e) {
            console.log(e)
        }
    }


    const handleUserDelete = async () => {
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
            const audioBlob = new Blob(audioChunks.current, { type: 'audio/ogg' })
            const audioFile = new File([audioBlob], 'audio.ogg', { type: 'audio/ogg' });

            const formData = new FormData();
            formData.append('audio', audioFile);
            formData.append('roomId', roomId);
            formData.append('sender', currentUser.username);
            // formData.append('audioURL',audioURL)
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

    const [selectedOnlineUsers, setSelectedOnlineUsers] = useState<string[]>([])


    const uploadFile = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('roomId', roomId);
            formData.append('sender', currentUser.username);
            if (selectedUser) {
                formData.append('receiver', selectedUser[index]?.username);
            }

            // Make a POST request to the server
            const response = await axios.post('https://giga-chat-2-frontend.vercel.app/uploadFile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const data = response.data;
            const fileURL = data.fileURL;
            setMessages((prevMessages) => [{ fileURL: fileURL, isSender: true }, ...prevMessages])
            if (socket) {
                socket.emit('voice_message', { fileURL: fileURL, sender: currentUser.username, receiver: selectedUser[index]?.username })
            }



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
                    <p className='ml-3 text'>Unarchive User</p>
                </div>

            </div>}
            <div className='w-[85vw] h-screen flex flex-row overflow-x-hidden overflow-y-hidden '>
                <div className='w-[20vw] min-w-[20vw] h-[100%] relative '>
                    <div className='w-[100%] h-[90%] relative'>
                        <div className='w-[100%] h-[7%] mt-6 flex justify-center items-center  p-1'>
                            <ArchiveIcon sx={{ color: "#fff", width: "20%", height: "70%", padding: "0", marginBottom: "1%" }} />

                            <p className='w-[100%] h-[90%] text-xl font-semibold text-white ' >Archieved Chats</p>
                        </div>

                        <div className='w-[100%]  h-[100%] overflow-y-scroll searchResults '>
                            {displaySearchResults ? <>
                                <div className=' flex flex-col items-center w-[100%] h-[fit-content]  border-b border-white relative z-10'>
                                    {searchResults.length > 0 && searchResults.map((result, index) => (
                                        <div className='w-[98%] h-[70px] flex border-none mb-3 rounded-sm cursor-pointer  bg-[#1e232c] hover:bg-[#3d3c3c] ' onClick={() => handleSearchResultClicked(result)} >
                                            <div className='relative w-[30%] h-[100%] flex justify-center items-center border-none'>
                                                <div className='relative w-[65px] h-[65px] border-none overflow-hidden rounded-full flex flex-center items-center justify-center' >
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
                            <div className='flex flex-col items-center relative z-10  h-[95%] overflow-y-scroll' >
                                {selectedUser && selectedUser?.map((user, index) => (
                                    <div className='w-[98%] h-[70px] bg-[#3d3c3c] border-none cursor-pointer mb-3 rounded-sm' onContextMenu={handleContextMenu} onClick={() => handleUserClick(index, user?.username, user?.roomId)} >
                                        <div className={`w-[100%] h-[100%] flex border-none mb-3 rounded-sm   bg-[${userClicked === index ? '#3d3c3c' : '#1e232c'}] hover:bg-[#3d3c3c]`}>
                                            <div className='relative w-[30%] h-[100%] flex justify-center items-center border-none'>
                                                <div className='relative w-[65px] h-[65px] border-none overflow-hidden rounded-full flex flex-center items-center justify-center' >
                                                    {user.profilePic ? <><img
                                                        src={`${user?.profilePic}`}
                                                        alt="profile"
                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    /></> : <PersonIcon sx={{ color: "white", width: "70%", height: "70%" }} />}

                                                </div>
                                            </div>
                                            <div className='relative w-[50%] h-[100%] border-none text-white rounded-e-sm '>
                                                <p className=' border-none items-center w-[100%] h-[60%]  rounded-e-2xl pt-2 ml-2 mx-auto font-bold text-lg' key={index}>{user.username}</p>
                                                <p className="italic border-none items-center w-[100%] h-[40%]  rounded-e-2xl  ml-2 mx-auto" key={index}>{user.name}</p>
                                            </div>
                                            <div className='relative w-[20%] h-[100%] flex justify-center items-center text-white rounded-e-sm '>
                                                {/* {seenPendingMessages[user?.username] && seenPendingMessages[user?.username] > 0 ? <>
                                                    <div className='w-[50%] h-[100%]  flex justify-center items-center ' ><p className='w-[20px] h-[20px] rounded-full text-[#3d3c3c] bg-white font-semibold  flex justify-center items-center ' >{seenPendingMessages[user?.username]}</p></div>
                                                </> : <> */}
                                                <div className={`w-[10px] h-[10px] rounded-full ${selectedOnlineUsers.includes(user?.username) ? 'bg-green-300' : 'bg-red-300'} `} ></div>
                                                {/* </>} */}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
                <div className={`flex flex-col w-[100%] h-screen justify-center items-center ${isChatWindowVisible === null ? 'hidden' : isChatWindowVisible ? 'chat-window' : 'chat-window-hidden'} `} >
                    <div className='flex flex-col justify-center items-center w-[100%] h-[85%] relative '>
                        <div className='flex justify-center items-center w-[100%] h-[15%]  ' >
                            <div className=' flex w-[90%] h-[80%] border border-[#1e232c] rounded ' >
                                <div className='w-[10%] h-[100%]  flex justify-center items-center ' >
                                    <div className='w-[50px] h-[50px] rounded-full border border-white overflow-hidden ' >
                                        <img
                                            src={`${selectedUser[index]?.profilePic}`}
                                            alt="profile"
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
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

                            {messages && messages.map((msg, idx) => (
                                <div className={`w-[450px] mb-20 border-none h-[150px] flex border mt-2 ${msg.isSender ? ' ml-auto sender' : ''} `} >
                                    {msg?.isSender ? <>
                                        <div className={`w-[fit-content] h-[fit-content] font-thin text-sm mt-2 p-0 mb-2 mr-0  ${msg.isSender ? 'bg-[#3d3c3c] ml-auto rounded-s bubble right ' : 'bg-[#1e232c] rounded-e bubble left '}  text-white flex flex-col  `}>
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
                                                    {msg?.message?.includes('https://giga-chat-frontend-seven.vercel.app/pages/room/') ? (
                                                        <>
                                                            {msg.message.split('https://giga-chat-frontend-seven.vercel.app/pages/room/')[0]}
                                                            <a href={`https://giga-chat-frontend-seven.vercel.app/pages/room/${msg.message.split('https://giga-chat-frontend-seven.vercel.app/pages/room/')[1]}`} target="_blank" rel="noopener noreferrer" className='underline'>click here</a>
                                                        </>
                                                    ) : (
                                                        <>{msg.message}</>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <div className='rounded-full border-none w-[40px] h-[40px] mt-[auto] overflow-hidden flex   justify-end ' >
                                            {profilePicPath?.profilePicPath ? <>
                                                <img
                                                    src={`${profilePicPath.profilePicPath}`}
                                                    alt="profile"
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                />
                                            </> : <>
                                                <PersonIcon sx={{ border: "1px solid white", borderRadius: "50px", color: "white", width: "35px", height: "35px" }} />
                                            </>}
                                        </div>

                                    </> : <>
                                        <div className='rounded-full border-none flex items-center justify-center w-[40px] h-[40px] overflow-hidden mt-[auto] ' >
                                            {/* <PersonIcon sx={{ marginTop: "100%", border: "1px solid white", borderRadius: "50px", color: "white", width: "35px", height: "35px" }} /> */}
                                            {selectedUser && selectedUser[index]?.profilePic ? <><img
                                                src={`${selectedUser[index]?.profilePic}`}
                                                alt="profile"
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            /></> : <PersonIcon sx={{ border: "1px solid white", borderRadius: "50px", color: "white", width: "35px", height: "35px" }} />
                                            }
                                        </div>
                                        <div className={`w-[fit-content] h-[fit-content] mt-auto font-thin text-sm mb-2 border-none ${msg.isSender ? 'bg-[#3d3c3c] ml-auto rounded-s bubble right ' : 'bg-[#1e232c] rounded-e bubble left '}  text-white p-[1.5%] flex font-semibold  `}>
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
                                                    {msg?.message?.includes('https://giga-chat-frontend-seven.vercel.app/pages/room/') ? (
                                                        <>
                                                            {msg.message.split('https://giga-chat-frontend-seven.vercel.app/pages/room/')[0]}
                                                            <a href={`https://giga-chat-frontend-seven.vercel.app/pages/room/${msg.message.split('https://giga-chat-frontend-seven.vercel.app/pages/room/')[1]}`} target="_blank" rel="noopener noreferrer" className='underline'>click here</a>
                                                        </>
                                                    ) : (
                                                        <>{msg.message}</>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </>}

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
            </div>
        </>
    )
}
