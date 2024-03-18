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
    const [currentUser, setCurrentUser] = useCookies(['username'])
    const [profilePicPath, setProfilePicPath] = useCookies(['profilePicPath'])
    const [recievedMessage, setRecievedMessage] = useState<string>('')
    const [isChatWindowVisible, setIsChatWindowVisible] = useState<boolean | null>(null)
    const [index, setIndex] = useState<number>(0)
    const [roomId, setRoomId] = useState<string>('')
    const [displayNoUsersFoundImg, setDisplayNoUsersFoundImg] = useState<boolean>(false)

    const [openAiChats, setOpenAiChats] = useState<object[]>([{ role: "system", content: "You are a helpful assistant , that tells the receiver what should be his next response based on the past conversations  " }, { role: "user", content: "Hello, how are you?" }])
    const socket = io('http://localhost:5000')

    useEffect(() => {
        if (socket) {
            if (!socket.hasListeners('receiveMessage')) {

                socket.on('receiveMessage', (data) => {
                    if (data.email !== emailCookie.email) {
                        setRecievedMessage(data.message)
                    }
                })
            }

            socket.on("checkRoomId", (data) => {
                console.log(data)
                const { room_Id, sender, receiver } = data;
                // console.log(room_Id, sender, receiver)
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

        return () => { socket.off; }
    }, [socket]);

    useEffect(() => {
        if (recievedMessage !== '') {
            setMessages((prevMessages) => [{ message: recievedMessage, isSender: false }, ...prevMessages])
            setOpenAiChats((prevChats) => [{ role: "sender", content: recievedMessage }, ...prevChats])
        }
    }, [recievedMessage]);

    const fetchInitialData = async () => {
        try {
            await fetch('http://localhost:4000/getArchivedUsers', {
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
                console.log(data.archivedUsers)
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
            const res = fetch('http://localhost:4000/addUserInSelectedUsers', {
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

    const handleUserClick = async (index: number) => {
        setIndex(index)
        setMessages([])
        setUserClicked(index);
        setRoomId(selectedUser[index]?.roomId)
        try {
            const res = await axios.post('http://localhost:4000/getChats', {
                currentUser: currentUser?.username,
                selectedUser: selectedUser[index]?.username,
            }).then((res) => {
                if (res?.status === 200) {
                    setMessages(res.data.chats)
                }
            })
        } catch (e) {
            console.log(e)
        }
        if (socket) {
            if (!isChatWindowVisible) {
                socket.emit("joinRoom", selectedUser[index]?.roomId);
                socket.emit("sendRoomId", {
                    roomId: selectedUser[index]?.roomId,
                    sender: currentUser,
                    receiver: selectedUser,
                });
            }
        }

    }

    const onChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const res = await fetch('http://localhost:4000/addChat', {
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
        setMessages((prevMessages) => [{ message: typedMessage, isSender: true }, ...prevMessages])
        setOpenAiChats((prevChats) => [{ role: "sender", content: typedMessage }, ...prevChats])
        console.log("before openai", openAiChats)
        if (socket) {
            setTypedMessage('')
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
            const res = await fetch('http://localhost:4000/unArchiveUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: currentUser?.username, selectedUser: selectedUser[index]?.username })
            }).then((res) => {
                if (res?.status === 200) {
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
                        title: "User UnArchieved Successfully!"
                    });
                }
            })
        } catch (e) {
            console.log(e)
        }
    }


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
                            <div className='flex flex-col items-center relative z-10  h-[95%] overflow-y-scroll' >
                                {selectedUser && selectedUser?.map((user, index) => (
                                    <div className='w-[98%] h-[70px] bg-[#3d3c3c] border-none cursor-pointer mb-3 rounded-sm' onContextMenu={handleContextMenu} onClick={() => handleUserClick(index)} >
                                        <div className={`w-[100%] h-[100%] flex border-none mb-3 rounded-sm   bg-[${userClicked === index ? '#3d3c3c' : '#1e232c'}] hover:bg-[#3d3c3c]`}>
                                            <div className='relative w-[30%] h-[100%] flex justify-center items-center border-none'>
                                                <div className='relative w-[65px] h-[65px] border-none overflow-hidden rounded-full flex flex-center items-center justify-center' >
                                                    {user.profilePic ? <><img
                                                        src={`http://localhost:4000/getprofilePic/${user?.profilePic}`}
                                                        alt="profile"
                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    /></> : <PersonIcon sx={{ color: "white", width: "70%", height: "70%" }} />}

                                                </div>
                                            </div>
                                            <div className='relative w-[70%] h-[100%] border-none text-white rounded-e-sm '>
                                                <p className=' border-none items-center w-[100%] h-[60%]  rounded-e-2xl pt-2 ml-2 mx-auto font-bold text-lg' key={index}>{user.username}</p>
                                                <p className="italic border-none items-center w-[100%] h-[40%]  rounded-e-2xl  ml-2 mx-auto" key={index}>{user.name}</p>
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

                            {messages && messages.map((msg, idx) => (
                                <div className={`w-[350px] border-none h-[150px] flex border mt-2 ${msg.isSender ? ' ml-auto sender' : ''} `} >
                                    {msg.isSender ? <>
                                        <div className={`w-[fit-content] h-[fit-content] font-thin text-sm mt-2 p-0 mb-2 mr-0  ${msg.isSender ? 'bg-[#3d3c3c] ml-auto rounded-s bubble right ' : 'bg-[#1e232c] rounded-e bubble left '}  text-white flex flex-col  `}>
                                            {msg.message}
                                        </div>
                                        <div className='rounded-full border-none w-[40px] h-[40px] mt-[auto] overflow-hidden flex   justify-end ' >
                                            {profilePicPath.profilePicPath ? <>
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
                                        <div className='rounded-full border-none flex items-center justify-center w-[40px] h-[40px] overflow-hidden mt-[auto] ' >
                                            {/* <PersonIcon sx={{ marginTop: "100%", border: "1px solid white", borderRadius: "50px", color: "white", width: "35px", height: "35px" }} /> */}
                                            {selectedUser && selectedUser[index]?.profilePic ? <><img
                                                src={`http://localhost:4000/getprofilePic/${selectedUser[index]?.profilePic}`}
                                                alt="profile"
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            /></> : <PersonIcon sx={{ border: "1px solid white", borderRadius: "50px", color: "white", width: "35px", height: "35px" }} />
                                            }
                                        </div>
                                        <div className={`w-[fit-content] h-[fit-content] mt-auto font-thin text-sm mb-2 border-none ${msg.isSender ? 'bg-[#3d3c3c] ml-auto rounded-s bubble right ' : 'bg-[#1e232c] rounded-e bubble left '}  text-white p-[1.5%] flex font-semibold  `}>{msg.message}</div>
                                    </>}

                                </div>
                            ))}

                        </div>
                    </div>

                    <div className='flex justify-center items-center w-[100%] h-[15%] relative '>
                        <div className='flex flex-center justify-center items-center relative w-[90%] h-[80%] border border-[#1e232c] rounded p-[5px] ' >
                            <form onSubmit={onChatSubmit} className='submit-chat-form' >
                                <input type="text" className='bg-[#1e232c] w-[100%] h-[100%] text-white text-center outline-none ' placeholder="Enter your message and hit 'Enter'" onChange={(e) => setTypedMessage(e.target.value)} value={typedMessage} />
                                <input type="submit" className='hidden w-[0%] h-[0%]' />
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}
