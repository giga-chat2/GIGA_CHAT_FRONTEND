"use client"
import React, { useEffect, useState } from 'react'
import Fuse from 'fuse.js';
import GroupsIcon from '@mui/icons-material/Groups';
import { useCookies } from 'react-cookie'
import { io } from 'socket.io-client';
import { nanoid } from '@reduxjs/toolkit';
import AddIcon from '@mui/icons-material/Add';
import { Multiselect } from 'multiselect-react-dropdown'
import './index.css'
import Swal from 'sweetalert2'
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import Drawer from 'react-modern-drawer'
import CloseIcon from '@mui/icons-material/Close';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

type User = {
    username: string,
    name: string
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
    const [emailCookie, setEmailCookie] = useCookies(['email' as string])
    const [messages, setMessages] = useState<object[]>([])
    const [isPopUpVisible, setIsPopUpVisible] = useCookies(['isPopUpVisible']);
    const [recievedMessage, setRecievedMessage] = useState<string>('')
    const [isChatWindowVisible, setIsChatWindowVisible] = useState<boolean | null>(null)
    const [roomId, setRoomId] = useState<string>('')

    const socket = io('http://localhost:4000')
    const [userClicked, setUserClicked] = useState<number | null>(null)
    const [dispCreateGroupPopUp, setDispCreateGroupPopUp] = useState<boolean | null>(null)
    const [options, setOptions] = useState([])
    const [currentUser, setCurrentUser] = useState<object>()
    const [selectedGroupMembers, setSelectedGroupMembers] = useState<object[]>([])
    const [groupName, setGroupName] = useState<string>('')
    const [admins, setAdmins] = useState<object[]>([])
    const [selectedGroups, setSelectedGroups] = useState<object[]>([])
    const [profilePicPath, setProfilePicPath] = useCookies(['profilePicPath'])
    const [sender, setSender] = useState<string>('')
    const [senderProfilePic, setSenderProfilePic] = useState<string>('')


    useEffect(() => {
        if (socket) {
            if (!socket.hasListeners('receiveMessage')) {

                socket.on('receiveMessage', (data) => {
                    if (data.email !== emailCookie.email) {
                        console.log("inside")
                        setRecievedMessage(data.message)
                        setSender(data.user)
                        setSenderProfilePic(data.profilePic)
                    }
                })
            }

            socket.on("checkRoomId", (data) => {
                const { room_Id, email } = data;
                if (email !== emailCookie.email) {
                    const isRoomIdPresent = selectedUser.find((user) => user.roomId == room_Id);
                    if (isRoomIdPresent) {
                        setRoomId(room_Id)
                        socket.emit("joinRoom", room_Id);
                    }
                }
            })
        }

        return () => { socket.off; }
    }, [socket]);

    useEffect(() => {
        if (recievedMessage !== '') {
            setMessages((prevMessages) => [{ message: recievedMessage, sender: sender, profilePic: senderProfilePic }, ...prevMessages])
        }
    }, [recievedMessage]);

    const fetchData = async () => {
        try {
            await fetch('http://localhost:4000/getInitlaData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: emailCookie.email })
            }).then(res => res.json()).then(data => {
                const reversedSelectedGroups = data.selectedGroups.slice().reverse();
                setSelectedGroups(reversedSelectedGroups);
                // setSelectedGroups(data.selectedGroups)
                setResults(data.groups)
                setOptions(data.selectedUsers)
                setCurrentUser(data.currentUser)
            })
        } catch (e) {
            console.log(e)
        }
    }


    useEffect(() => {
        fetchData()
        setIsChatWindowVisible(true);
    }, [])


    const fuse = new Fuse(results, {
        includeScore: true,
        keys: ['groupName'],
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
                const results = fuse?.search(term);
                const sortedResults: any = results
                    .sort((a, b) => (a?.score ?? 0) - (b?.score ?? 0))
                    .map((result: any) => result.item);


                setSearchResults(sortedResults);
            } catch (e) {
                console.log(e)
            }

        }
    };

    const handleSearchResultClicked = (result: object) => {
        setDisplaySearchResults(false)
        setSearchTerm('')
        setRoomId(nanoid())

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

    const handleGroupClick = (index: number) => {
        // setIsChatWindowVisible(!isChatWindowVisible)
        setMessages(selectedGroups[index]?.messages)
        setIsChatWindowVisible(true);
        setUserClicked(index);
        console.log(selectedGroups[index]?.roomId)
        setRoomId(selectedGroups[index]?.roomId)
        console.log("handleGroupClicled", roomId)
        if (socket) {
            socket.emit("joinRoom", selectedGroups[index]?.roomId);
            console.log("sender joining room")
            socket.emit("sendRoomId", { roomId: selectedGroups[index]?.roomId, email: emailCookie.email });
        }
    }

    const onChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log("forrm submitted")
        setMessages((prevMessages) => [{ message: typedMessage, sender: currentUser.username }, ...prevMessages])
        if (socket) {
            setTypedMessage('')
            socket.emit("sendMessage", { message: typedMessage, profilePic: profilePicPath?.profilePicPath, room_Id: roomId, user: currentUser?.username, email: emailCookie.email });

        }
        const res = await fetch('http://localhost:4000/addChatInGroup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: typedMessage, profilePic: profilePicPath?.profilePicPath, room_Id: roomId, currentUser: currentUser })
        }).then((res) => {
            if (res?.status === 200) {
                console.log('Message sent successfully.')
            }
        })
    }



    const handleCreateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setDispCreateGroupPopUp(false)
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
        Toast.fire({
            icon: "success",
            title: "Group created successfully!"
        });

        const res = await fetch('http://localhost:4000/createGroup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ groupName: groupName, room_Id: nanoid(), currentUser: currentUser, selectedGroupMembers: selectedGroupMembers, admins: admins })
        })
        const data = await res.json()
        setSelectedGroups([data.currentGroup, ...selectedGroups])
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
    }

    const handleUserDelete = async () => {

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
                        {selectedUser && selectedUser[userClicked]?.profilePic ? <><img
                            src={`http://localhost:4000/getprofilePic/${selectedUser[userClicked]?.profilePic}`}
                            alt="profile"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        /></> : <PersonIcon sx={{ color: "white", width: "100%", height: "100%" }} />}
                    </div>
                </div>
                {selectedUser ? <>
                    {/* <div className='w-[100%] h-[20%] flex flex-col justify-center items-center '>
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
                </div> */}
                </> : <></>}

            </Drawer>
            {contextMenu.show && <div className={`absolute z-50 bg-black border border-white w-[200px] h-[150px] flex flex-col justify-center items-center rounded-md`} ref={contextMenuRef} onClick={handleContextMenuClose} style={{ top: contextMenu.y, left: contextMenu.x }} >
                <div className={`w-[100%] h-[33%] flex  justify-start cursor-pointer items-center border-b border-white text-white `} onMouseEnter={handleHover} onMouseLeave={handleMouseLeave} onClick={() => setIsOpen(true)} >
                    <PersonRoundedIcon sx={{ color: "white", width: "20%", height: "50%" }} className='icon' />
                    <p className='ml-3 text'>View Group</p>
                </div>
                <div className={`w-[100%] h-[34%] flex justify-start cursor-pointer items-center border-white text-white `} onMouseEnter={handleHover} onMouseLeave={handleMouseLeave} onClick={handleUserDelete} >
                    <DeleteIcon sx={{ color: "white", width: "20%", height: "50%" }} className='icon' />
                    <p className='ml-3 text' >Delete Group</p>
                </div>
                <div className={`w-[100%] h-[34%] flex justify-start cursor-pointer items-center border-white text-white `} onMouseEnter={handleHover} onMouseLeave={handleMouseLeave} onClick={handleUserDelete} >
                    <ExitToAppIcon sx={{ color: "white", width: "20%", height: "50%" }} className='icon' />
                    <p className='ml-3 text' >Leave Group</p>
                </div>
            </div>}
            <div className='w-[85vw] h-screen flex flex-row overflow-x-hidden overflow-y-hidden ' onClick={() => { if (dispCreateGroupPopUp) { setDispCreateGroupPopUp(false) } }} >
                <div className={`w-[35vw] h-[55vh] border flex-col z-10 bg-black justify-center hidden border-white absolute left-[35%] top-[20%] rounded-lg ${dispCreateGroupPopUp === null ? '' : dispCreateGroupPopUp ? 'appear' : 'disappear'}`} onClick={(e) => e.stopPropagation()} >
                    <form className='w-[100%] h-[100%] relative ' onSubmit={handleCreateGroup}>
                        <div className=' w-[100%] h-[20%] font-semibold  flex text-2xl rounded-lg text-center justify-center items-center text-white'>Create your Group</div>
                        <div className=' w-[100%] h-[20%] font-semibold  flex text-center justify-center items-center text-white'><input type="text" className='bg-black text rounded text-white w-[75%] h-[80%] text-center border border-white outline-none groupNameInput' onChange={(e: any) => setGroupName(e.target.value)} value={groupName} placeholder='Enter your group name' required /></div>
                        <div className=' w-[100%] h-[20%] font-semibold  flex text-center justify-center items-center text-white'>
                            <Multiselect options={options} placeholder='Select members' displayValue='username' className='multi-select' onSelect={(selectedList, selectedItem) => { setSelectedGroupMembers(selectedList) }} onRemove={(selectedList, removedItem) => { setSelectedGroupMembers(selectedList) }}
                                style={{
                                    option: {
                                        color: "#fff"
                                    },
                                    searchBox: {
                                        border: '1px solid #ccc',
                                        borderRadius: '5px',
                                    },
                                    inputField: {
                                        color: '#333',
                                    },
                                    chips: {
                                        border: '1px solid #fff',
                                        background: '#1e232c',
                                        color: '#fff',
                                    },
                                    highlightOption: {
                                        backgroundColor: "black !important",
                                        color: "white !important"
                                    }
                                }}
                            />
                        </div>
                        <div className=' w-[100%] h-[20%] font-semibold  flex text-center justify-center items-center text-white'>
                            <Multiselect options={selectedGroupMembers} placeholder='Select admins' displayValue='username' className='multi-select' onSelect={(selectedList, selectedItem) => { setAdmins(selectedList) }} onRemove={(selectedList, removedItem) => { setAdmins(selectedList) }}
                                style={{
                                    option: {
                                        color: "#fff"
                                    },
                                    searchBox: {
                                        border: '1px solid #ccc',
                                        borderRadius: '5px',
                                    },
                                    inputField: {
                                        color: '#333',
                                    },
                                    chips: {
                                        border: '1px solid #fff',
                                        background: '#1e232c',
                                        color: '#fff',
                                    },
                                    highlightOption: {
                                        backgroundColor: "black !important",
                                        color: "white !important"
                                    }
                                }}
                            />
                        </div>
                        <div className=' w-[100%] h-[20%] font-semibold flex text-center justify-center items-center text-white' >
                            <button type='submit' className='width-[10%] h-[50%] bg-black border border-white createGrpButton rounded-md ' >Submit</button>
                        </div>
                    </form>
                </div>

                {/* </> : <></>} */}
                <div className='w-[20vw] min-w-[20vw] h-[100%] relative '>
                    <div className='w-[100%] h-[90%] relative'>
                        <div className='w-[100%] h-[7%] mt-6 flex justify-center items-center  p-1'>
                            <GroupsIcon sx={{ color: "#fff", width: "20%", height: "70%", padding: "0", marginBottom: "1%" }} />
                            <p className='w-[100%] h-[90%] text-xl font-semibold text-white ' >Group Chats</p>
                        </div>
                        <div className='w-[100%] h-[7%] flex justify-center items-center p-1'>
                            <input
                                type="text"
                                placeholder='Search your group...'
                                className='w-[100%] h-[100%] text-center rounded bg-[#1e232c] text-white border border-none focus:border-none outline-none '
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                        <div className='w-[100%]  h-[100%] overflow-y-scroll searchResults '>
                            {displaySearchResults ? <>
                                <div className=' bg-[#1e232c] hover:bg-[#3d3c3c] text-center text-white flex justify-center items-center ml-1 w-[98%] mt-2 mb-2 h-[7%] rounded-sm font-medium cursor-pointer' onClick={() => { if (dispCreateGroupPopUp === null) { setDispCreateGroupPopUp(true) } else { setDispCreateGroupPopUp(!dispCreateGroupPopUp) } }} > <AddIcon />Create New Group</div>
                                <div className=' flex flex-col items-center w-[100%] h-[fit-content] border-b border-white relative z-10'>
                                    {searchResults.length > 0 && searchResults.map((result, index) => (
                                        <div className='w-[98%] h-[70px] flex border-none mb-3 rounded-sm  bg-[#1e232c] hover:bg-[#3d3c3c] cursor-pointer ' onClick={() => handleSearchResultClicked(result)} >
                                            <div className='relative w-[20%] h-[100%] border-none'>
                                                <div className='relative w-[100%] h-[100%] border-none rounded-full flex flex-center items-center justify-center' >
                                                    <GroupsIcon sx={{ color: "white", width: "70%", height: "70%" }} />
                                                </div>
                                            </div>
                                            <div className='relative w-[80%] h-[100%] border-none text-white rounded-e-sm '>
                                                <p className=' border-none items-center w-[100%] h-[60%]  rounded-e-2xl pt-2 ml-2 mx-auto font-bold text-lg' key={index}>{result.groupName}</p>
                                                <p className="italic border-none items-center w-[100%] h-[40%]  rounded-e-2xl  ml-2 mx-auto" key={index}>{result.members[1].username} +{result.length}more...</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </> : <>

                            </>}
                            <div className='flex flex-col items-center relative z-10 mt-1 h-[95%] overflow-y-scroll' >
                                {selectedGroups && selectedGroups?.map((user, index) => (
                                    <div className='w-[98%] h-[70px] bg-[#3d3c3c] border-none cursor-pointer mb-3 rounded-sm' onContextMenu={handleContextMenu} onClick={() => handleGroupClick(index)} >
                                        <div className={`w-[100%] h-[100%] flex border-none mb-3 rounded-sm   bg-[${userClicked === index ? '#3d3c3c' : '#1e232c'}] hover:bg-[#3d3c3c]`}>
                                            <div className='relative w-[20%] h-[100%] border-none'>
                                                <div className='relative w-[100%] h-[100%] border-none rounded-full flex flex-center items-center justify-center' >
                                                    <GroupsIcon sx={{ color: "white", width: "70%", height: "70%" }} />
                                                </div>
                                            </div>
                                            <div className='relative w-[80%] h-[100%] border-none text-white rounded-e-sm '>
                                                <p className=' border-none items-center w-[100%] h-[60%]  rounded-e-2xl pt-2 ml-2 mx-auto font-bold text-lg' key={index}>{user.groupName}</p>
                                                <p className="italic border-none items-center w-[100%] h-[40%]  rounded-e-2xl  ml-2 mx-auto" key={index}>{user.members[1].username}  +{user.members.length} more...</p>
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
                        <div className='relative flex flex-col-reverse w-[90%] h-[90%] border border-[#1e232c] rounded overflow-y-auto ' >
                            {messages && messages.map((msg, index) => (
                                <div className={`w-[350px] border-none h-[150px] flex border  ${msg.sender === currentUser.username ? ' ml-auto sender' : ''} `} >
                                    {msg.sender === currentUser.username ? <>
                                        <div className={`w-[fit-content] h-[fit-content] mt-2 mb-2 mr-0  ${msg.sender === currentUser.username ? 'bg-[#3d3c3c] ml-auto rounded-s bubble right ' : 'bg-[#1e232c] rounded-e bubble left '}  text-white flex font-thin text-sm  `}>{msg.message}</div>
                                        <div className='rounded-full border-none w-[40px] h-[40px] mt-auto flex justify-center items-center overflow-hidden ' >
                                            {profilePicPath.profilePicPath ? <> <img src={`http://localhost:4000/getprofilePic/${profilePicPath.profilePicPath}`} alt="" /> </> : <>
                                                <PersonIcon sx={{ borderRadius: "50px", color: "white", width: "35px", height: "35px" }} />
                                            </>}
                                        </div>

                                    </> : <>
                                        <div className='rounded-full flex items-center justify-center w-[40px] h-[40px] overflow-hidden mt-[auto] ' >
                                            {msg?.profilePic?.length > 0 ? <img src={`http://localhost:4000/getprofilePic/${msg.profilePic}`} alt="" /> : <PersonIcon sx={{ border: "1px solid white", borderRadius: "50px", color: "white", width: "35px", height: "35px" }} />}
                                            {/* <PersonIcon sx={{ marginTop: "100%", border: "1px solid white", borderRadius: "50px", color: "white", width: "35px", height: "35px" }} /> */}
                                        </div>
                                        <div className={`w-[fit-content] h-[fit-content] mt-[auto] font-thin text-sm mb-2 border-none ${msg.sender === currentUser.username ? 'bg-[#3d3c3c] ml-auto rounded-s bubble right ' : 'bg-[#1e232c] rounded-e bubble left '}  text-white p-[1.5%] flex font-semibold  `}>{msg.message}</div>
                                    </>}

                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='flex justify-center items-center w-[100%] h-[15%] relative '>
                        <div className='flex flex-center justify-center items-center relative w-[90%] h-[80%] border border-[#1e232c] rounded p-[5px] ' >
                            <form onSubmit={onChatSubmit} className='w-[100%] h-[100%]' >
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