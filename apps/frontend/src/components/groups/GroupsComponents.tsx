// @ts-nocheck
"use client"
import React, { useEffect, useState, useRef } from 'react'
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
import axios from 'axios';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import StraightIcon from '@mui/icons-material/Straight';
import SettingsVoiceIcon from '@mui/icons-material/SettingsVoice';
import OpenAI from "openai";
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import EditIcon from '@mui/icons-material/Edit';
import NotificationAddIcon from '@mui/icons-material/NotificationAdd';
import HandshakeIcon from '@mui/icons-material/Handshake';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useSession } from 'next-auth/react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import FileOpenIcon from '@mui/icons-material/FileOpen';

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


const socket = io('https://giga-chat-socket.onrender.com')

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

export const MainComponent: React.FC = () => {
    const [results, setResults] = useState<object>()
    const [displaySearchResults, setDisplaySearchResults] = useState<boolean>(false)
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState<object[]>([]);
    const [typedMessage, setTypedMessage] = useState<string>('')
    const [emailCookie, setEmailCookie] = useCookies(['email' as string])
    const [messages, setMessages] = useState<object[]>([])
    const [isPopUpVisible, setIsPopUpVisible] = useCookies(['isPopUpVisible']);
    const [recievedMessage, setRecievedMessage] = useState<string>('')
    const [isChatWindowVisible, setIsChatWindowVisible] = useState<boolean | null>(null)
    const [roomId, setRoomId] = useState<string>('')
    const [userClicked, setUserClicked] = useState<number | null>(null)
    const [dispCreateGroupPopUp, setDispCreateGroupPopUp] = useState<boolean | null>(null)
    const [options, setOptions] = useState([])
    const [currentUser, setCurrentUser] = useState<object>()
    const [currentUserName, setCurrentUserName] = useCookies(['username'])
    const [selectedGroupMembers, setSelectedGroupMembers] = useState<object[]>([])
    const [groupName, setGroupName] = useState<string>('')
    const [admins, setAdmins] = useState<object[]>([])
    const [selectedGroups, setSelectedGroups] = useState<object[]>([])
    const [profilePicPath, setProfilePicPath] = useCookies(['profilePicPath'])
    const [sender, setSender] = useState<string>('')
    const [senderProfilePic, setSenderProfilePic] = useState<string>('')
    const [placeholderVal, setPlaceholderVal] = useState("Enter your message and hit 'Enter'")
    const [openAiChats, setOpenAiChats] = useState<object[]>([{ role: "system", content: "You are a helpful assistant , that responds on behalf of the user based on the past conversation . Just make a logical guess what could user might say next and just give that as an output . If the newest role is user then just provide the follow-up sentence that the user might say and if the newest role is assistant then just provide the response to it as an output" }])
    const [voiceNote, setVoiceNote] = useState<any>()
    const [aiSuggestions, setAiAuggestions] = useCookies(['aiSuggestions'])
    const [dispStatus, setDispStatus] = useCookies(['dispStatus'])
    const [idx, setIdx] = useState<number>(0)
    // const [groupRoomIdCookie, setGroupRoomIdCookie] = useCookies(['groupRoomId'])
    const [roomID, setRoomID] = useCookies(['roomID'])
    const [currentGroupName, setCurrentGroupName] = useCookies(['currentGroupName'])
    const session = useSession()
    const [fileReceived, setFileReceived] = useState<any>()

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
            // if (!socket.hasListeners('receive_Message')) {

            //     // socket.on('receive_Message', (data) => {
            //     //     console.log(data.email, emailCookie.email, data.roomId, "HUHU", roomID.roomID)
            //     //     if (data.roomId === roomID.roomID) {
            //     //         console.log("inside")
            //     //         setRecievedMessage(data.message)
            //     //         setSender(data.user)
            //     //         setSenderProfilePic(data.profilePic)
            //     //     }
            //     // })
            // }

            socket.on('receive_grp_message', (data) => {
                console.log(data.groupName, getCookieValue('currentGroupName'))
                if (data.groupName === getCookieValue('currentGroupName')) {
                    setRecievedMessage(data.message)
                    setSender(data.sender)
                    setSenderProfilePic(data.profilePic)
                }
                // console.log(data)
                // setRecievedMessage(data.message)
                // setSender(data.sender)
                // setSenderProfilePic(data.profilePic)
            })

            // socket.on('receive_voice_message', (data) => {
            //     // console.log(data)
            //     setSender(data.user)
            //     setSenderProfilePic(data.profilePic)
            //     setVoiceNote(data.audioURL)
            // })

            socket.on('receive_voice_message', (data) => {
                if (data.groupName === getCookieValue('currentGroupName')) {
                    if (data.audioURL) {
                        setSender(data.sender)
                        setSenderProfilePic(data.profilePic)
                        setVoiceNote(data.audioURL)
                    } else if (data.fileURL) {
                        setSender(data.sender)
                        setSenderProfilePic(data.profilePic)
                        setFileReceived(data.fileURL)
                    }
                }
            })

            socket.on("check_RoomId", (data) => {
                const { room_Id, email } = data;
                if (email !== emailCookie.email) {
                    const isRoomIdPresent = selectedUser.find((user) => user.roomId == room_Id);
                    if (isRoomIdPresent) {
                        setRoomId(room_Id)
                        socket.emit("join_Room", { room_Id: room_Id, username: currentUser.username });
                    }
                }
            })
        }

        return () => { socket.off; }
    }, [socket]);

    useEffect(() => {
        if (voiceNote) {
            if (messages && messages.length > 0) {
                setMessages((prevMessages) => [{ audioURL: voiceNote, sender: sender, profilePic: senderProfilePic }, ...prevMessages])
            } else {
                setMessages([{ audioURL: voiceNote, sender: sender, profilePic: senderProfilePic }])
            }
        }
    }, [voiceNote])

    useEffect(() => {
        if (fileReceived) {
            if (messages && messages.length > 0) {
                setMessages((prevMessages) => [{ fileURL: fileReceived, sender: sender, profilePic: senderProfilePic }, ...prevMessages])
            } else {
                setMessages([{ fileURL: fileReceived, sender: sender, profilePic: senderProfilePic }])
            }
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
        if (firstTimeLoaded) {
            handleAiSuggestion("assistant", "Provide response for this : " + recievedMessage)
        } else {
            setFirstTimeLoaded(true)
        }
        if (recievedMessage !== '' && messages) {
            setMessages((prevMessages) => [{ message: recievedMessage, sender: sender, profilePic: senderProfilePic }, ...prevMessages])
            setOpenAiChats((prevChats) => [...prevChats, { role: "assistant", content: recievedMessage }])
        }
    }, [recievedMessage]);

    const fetchData = async () => {
        try {
            await fetch('https://giga-chat-2-backend.vercel.app/getInitlaData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: emailCookie.email })
            }).then(res => res.json()).then(data => {
                const reversedSelectedGroups = data.selectedGroups.slice().reverse();
                setSelectedGroups(reversedSelectedGroups);
                // setSelectedGroups(data.selectedGroups)
                // console.log(data.selectedUsers)
                // setResults()
                const groupsNotInSelected = data.groups.filter(
                    (group) => !data.selectedGroups.some(selectedGroup => selectedGroup.groupName === group.groupName)
                );

                setResults(groupsNotInSelected);
                setOptions(data.selectedUsers)
                setCurrentUser(data.currentUser)
                handleGroupClick(0, reversedSelectedGroups[0]?.groupName, reversedSelectedGroups[0]?.roomId)
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
        setSearchTerm('')
        Swal.fire({
            title: 'Are you sure?',
            text: "Send request to join this group",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, send request!'
        }).then(async (res) => {
            if (res.isConfirmed) {
                const response = await fetch('https://giga-chat-2-backend.vercel.app/sendRequestToJoinGroup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ currentUser: currentUser, groupName: result?.groupName })
                })
                if (response.status === 200) {
                    Swal.fire(
                        'Request Sent!',
                        'Your request has been sent successfully.',
                        'success'
                    )
                    setDisplaySearchResults(false)
                }
            } else {
                setDisplaySearchResults(false)
            }
        })
    }

    const [selectedDetailedGroupAdmins, setSelectedDetailedGroupAdmins] = useState<object[]>([])
    const [selectedDetailedGroupMembers, setSelectedDetailedGroupMembers] = useState<object[]>([])


    const handleGroupClick = async (index: number, initialSelectedGroupName: any = null, room_ka_ID: any = null) => {
        setIdx(index)
        console.log(selectedGroups, selectedGroups[index])
        if (initialSelectedGroupName) {
            setCurrentGroupName('currentGroupName', initialSelectedGroupName, { path: '/' })
        }
        // if (roomID.roomID && roomID.roomID !== '' && roomID.roomID !== 'undefined' && socket) {
        //     console.log(currentUserName?.username,roomID.roomID.toString() )
        //     socket.emit("leave_Room", { room_Id: roomID.roomID.toString(), username: currentUserName?.username });
        // }

        // if (selectedGroups[index]?.groupName) {
        setRoomId(room_ka_ID)
        // }
        // if (selectedGroups[index]) {
        //     setRoomID('roomID', selectedGroups[index]?.roomId, { path: '/' })
        // }
        try {
            const response = await axios.post('https://giga-chat-2-backend.vercel.app/getGroupChats', { groupName: initialSelectedGroupName })
            setMessages(response.data.chats)
        } catch (e) { console.log(e) }

        setSelectedDetailedGroupAdmins(selectedGroups[index]?.admins)
        setSelectedDetailedGroupMembers(selectedGroups[index]?.members)
        setIsChatWindowVisible(true);
        setUserClicked(index);


        // if (socket) {
        //     socket.emit("join_Room", { room_Id: selectedGroups[index]?.roomId.toString(), username: currentUserName?.username });
        //     console.log("sender joining room")
        // }
    }

    const onChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log("forrm submitted")
        setMessages((prevMessages) => [{ message: typedMessage, sender: currentUser.username }, ...prevMessages])
        if (socket) {
            setTypedMessage('')
            // socket.emit("send_Message", { message: typedMessage, profilePic: profilePicPath?.profilePicPath, room_Id: selectedGroups[idx].roomId, user: currentUser?.username, email: emailCookie.email });
            socket.emit("send_grp_message", { message: typedMessage, profilePic: profilePicPath?.profilePicPath, sender: currentUserName?.username, groupName: selectedGroups[idx]?.groupName })
        }
        const res = await fetch('https://giga-chat-2-backend.vercel.app/addChatInGroup', {
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
        handleAiSuggestion("user", "Provide output in maximum 10 words for the follow up :" + typedMessage)
        // if (messages) {
        //     setMessages((prevMessages) => [{ message: typedMessage, isSender: true }, ...prevMessages])
        //     setOpenAiChats((prevChats) => [...prevChats, { role: "user", content: typedMessage }])
        // } else {
        //     setMessages([{ message: typedMessage, isSender: true }])
        //     setOpenAiChats((prevChats) => [...prevChats, { role: "user", content: typedMessage }])
        // }
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

        const res = await fetch('https://giga-chat-2-backend.vercel.app/createGroup', {
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

    const handleUserDelete = async () => {

    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.keyCode === 9) {
            e.preventDefault();
            const inputField = e.currentTarget;
            setTypedMessage(inputField.placeholder);
        }
    };

    const handleIconClick = () => {
        fileInputRef?.current.click();
    };
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef(null);
    const [retrievedProfilePic, setRetrievedProfilePic] = useState<boolean>(false)
    const [groupProfilePicPath, setGroupProfilePicPath] = useCookies(['groupProfilePicPath'])


    useEffect(() => {
        if (selectedGroups && selectedGroups[idx]?.profilePic) {
            setRetrievedProfilePic(true)
        }
    }, [selectedGroups])



    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files[0];
        setSelectedGroups(selectedGroups.map((group, index) => { return index === idx ? { ...group, profilePic: URL.createObjectURL(selectedFile) } : group }))

        const reader = new FileReader();
        console.log(1, selectedFile, e.target.result)
        reader.onload = async (event: ProgressEvent<FileReader>) => {
            console.log(2)
            setSelectedImage(event.target.result);
            const formData = new FormData();
            formData.append('groupName', selectedGroups[idx].groupName)
            formData.append('profilePic', selectedFile);
            try {
                console.log("before calling")
                const response = await axios.post('https://giga-chat-2-backend.vercel.app/uploadGroupProfilePic', formData);
                console.log("after calling")
                if (response.status === 200) {
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
                        title: "Profile Picture Updated Successfully!"
                    });
                }
            } catch (e) { console.log(e) }
        };
        if (selectedFile) {
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleLeaveGroup = async () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You want to leave this group!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, leave it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const res = await fetch('https://giga-chat-2-backend.vercel.app/leaveGroup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ currentUser: currentUser, groupName: selectedGroups[idx].groupName })
                })
                setSelectedGroups(selectedGroups.filter((group, index) => index !== idx))
                setIsOpen(false)
                Swal.fire(
                    'Group Left!',
                    'You have successfully left the group.',
                    'success'
                )
            }
        })
    }

    const [is_recording, setIsRecording] = useState(false)
    const audioChunks = React.useRef<any[]>([])
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
    async function startRec() {
        console.log(1)
        setIsRecording(true)
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorder.start()
        mediaRecorder.ondataavailable = (e) => {
            console.log(2)
            if (e.data.size > 0) {
                audioChunks.current.push(e.data)
            }
        }
        mediaRecorder.onstop = async () => {
            console.log(3)
            const audioBlob = new Blob(audioChunks.current, { type: 'audio/ogg' })
            const audioFile = new File([audioBlob], 'audio.ogg', { type: 'audio/ogg' });

            const formData = new FormData();
            formData.append('audio', audioFile);
            formData.append('roomId', roomId);
            formData.append('sender', currentUser.username);
            formData.append('profilePic', profilePicPath?.profilePicPath);

            try {
                const response = await axios.post('https://giga-chat-2-backend.vercel.app/groupUploadAudio', formData)
                console.log(response)
                const data = response.data;
                const audioURL = data.audioURL;
                setMessages((prevMessages) => [{ audioURL: audioURL, sender: currentUser?.username }, ...prevMessages])
                if (socket) {
                    socket.emit('voice_message', { audioURL: audioURL, groupName: selectedGroups[idx].groupName, profilePic: profilePicPath?.profilePicPath, user: currentUserName?.username });
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

    const [dispAddMembersPopUp, setDispAddMembersPopUp] = useState<boolean>(false)
    const [availableMembers, setAvailableMembers] = useState<object[]>([])

    const handleViewGroup = () => {
        setIsOpen(true)
        let groupMembers = selectedGroups[idx]?.members
        let allUsers = options
        let availableMembersForGroup = allUsers.filter((user) => !groupMembers.some((member) => member.username === user.username))
        console.log(availableMembersForGroup)
        setAvailableMembers(availableMembersForGroup)
    }

    const handleDispAddMemberPopUp = () => {
        setDispAddMembersPopUp(!dispAddMembersPopUp)
    }

    const [requestedMembers, setRequestedMembers] = useState<object[]>([])

    const handleAddMembers = async () => {
        try {
            console.log(groupName, selectedGroupMembers, requestedMembers)
            const combineMembers = [...selectedGroupMembers, ...requestedMembers]
            const response = await axios.post('https://giga-chat-2-backend.vercel.app/addNewMembersToGroup', { groupName: selectedGroups[idx]?.groupName, selectedGroupMembers: combineMembers })
            if (response.status === 200) {
                Swal.fire(
                    'Members Added!',
                    'Members have been added successfully.',
                    'success'
                )
                setDispAddMembersPopUp(false)
            }
        } catch (e) { console.log(e) }
    }

    const uploadFile = async (file: File) => {
        try {
            console.log(1)
            const formData = new FormData();
            formData.append('file', file);
            formData.append('roomId', roomId);
            formData.append('sender', currentUser.username);
            formData.append('profilePic', profilePicPath?.profilePicPath);

            console.log(2)

            const response = await axios.post('https://giga-chat-2-backend.vercel.app/groupUploadFile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log(3)

            const data = response.data;
            const fileURL = data.fileURL;
            setMessages((prevMessages) => [{ fileURL: fileURL, sender: currentUser?.username }, ...prevMessages])
            if (socket) {
                socket.emit('voice_message', { fileURL: fileURL, groupName: selectedGroups[idx].groupName, profilePic: profilePicPath?.profilePicPath, user: currentUserName?.username })
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
            {/* {dispAddMembersPopUp ?
                <> */}
            <div className={`w-[700px] top-[15%] z-20 left-[30%] h-[400px] absolute border border-white bg-black rounded-md flex flex-col justify-center items-center ${dispAddMembersPopUp === null ? '' : dispAddMembersPopUp ? 'appear' : 'disappear'}`} onClick={(e) => e.stopPropagation()} >
                <div className='w-[100%] h-[20%]  flex justify-center items-center ' >
                    <p className='text-white text-2xl font-semibold ' > <GroupAddIcon sx={{ width: '40px', marginBottom: '1%', height: '30px', color: 'white' }} /> Add Members to {selectedGroups[idx]?.groupName} </p>
                </div>
                <div className='w-[100%] h-[20%] e mt-5 mb-5 flex justify-start items-center ' >
                    <p className=' w-[30%] h-[100%] flex justify-center items-center  ml-[35px] text-white text-xl font-semibold ' ><HandshakeIcon sx={{ width: '40px', marginBottom: '1%', height: '30px', color: 'white' }} />   Add friends</p>
                    <Multiselect options={availableMembers} placeholder='Select members' displayValue='username' className='multi-select w-[100px] ml-5 ' onSelect={(selectedList, selectedItem) => { setSelectedGroupMembers(selectedList) }} onRemove={(selectedList, removedItem) => { setSelectedGroupMembers(selectedList) }}
                        style={{
                            option: {
                                color: "#fff",
                                width: '100%'
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
                <div className='w-[100%] h-[20%]  flex justify-start items-center ' >
                    <p className=' w-[30%] h-[100%] ml-[35px] flex justify-center items-center text-white text-xl font-semibold ' > <MoveToInboxIcon sx={{ width: '40px', marginBottom: '1%', height: '30px', color: 'white' }} />  Requests {selectedGroups[idx]?.requests.length > 0 ? '(' + selectedGroups[idx]?.requests.length + ')' : ''}</p>
                    <Multiselect options={selectedGroups[idx]?.requests} placeholder='Select members' displayValue='username' className='multi-select w-[100px] ml-5 ' onSelect={(selectedList, selectedItem) => { setRequestedMembers(selectedList) }} onRemove={(selectedList, removedItem) => { setRequestedMembers(selectedList) }}
                        style={{
                            option: {
                                color: "#fff",
                                width: '100%'
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
                <div className='w-[100%] h-[20%] flex justify-center items-center  mt-5  ' >
                    <button className='w-[20%] h-[60%] border border-white rounded-md text-white addMembersButton ' onClick={handleAddMembers} > Add Members</button>
                </div>
            </div>
            {/* </>
                : <></>} */}
            <Drawer
                open={isOpen}
                onClose={() => setIsOpen(false)}
                direction='right'
                className='drawer'
                style={{ width: "25vw", backgroundColor: "#1e232c" }}
            >
                <div className='absolute top-0 right-0 w-[40px] h-[30px] cursor-pointer z-50 border border-white flex justify-center items-center' onClick={() => { setDispAddMembersPopUp(false); setIsOpen(false) }} ><CloseIcon style={{ width: "80%", height: "80%", color: "white", cursor: "pointer" }} /></div>
                <div className='w-[100%] h-[30%] relative flex justify-center items-center cursor-pointer ' >
                    <NotificationAddIcon sx={{ position: 'absolute', width: '30px', height: '30px', top: '15px', left: '15px', color: 'white' }} onClick={handleDispAddMemberPopUp} />
                    <div className='w-[200px] h-[200px] rounded-full flex justify-center items-center border border-white overflow-hidden ' onClick={handleIconClick}  >
                        {selectedGroups[idx]?.profilePic ? <>

                            <img
                                src={selectedImage ? selectedImage : `${selectedGroups[idx].profilePic}`}
                                alt="profile"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        </> : <>
                            {selectedImage ? <>
                                <img
                                    src={selectedImage}
                                    alt="profile"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            </> : <>
                                <PersonIcon style={{ color: "white", width: "70%", height: "70%" }} /></>}

                        </>}
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
                <div className='w-[100%] h-[10%] flex flex-col justify-center items-center'>
                    <p className='w-[100%] h-[50%] flex justify-center items-center text-white text-2xl font-bold' >{selectedGroups[idx]?.groupName}</p>
                    <p className='w-[100%] h-[50%] flex justify-center items-center text-white text-md pl-5 ' >❝One day we will rise❞ <EditIcon sx={{ width: '10%', height: '45%', padding: '0', color: 'white' }} /> </p>
                </div>
                <div className='w-[100%] h-[60%] pt-5 border-t border-white flex flex-col justify-center items-center' >
                    <div className='w-[100%] h-[25%] flex flex-col items-center justify-center ' >
                        <div className='w-[100%] h-[20%] flex justify-center items-center text-white text-xl italic ' >Admins</div>
                        <AvatarGroup sx={{ width: "80%", height: "80%", display: 'flex', justifyContent: "center", alignItems: "center" }} max={4}>
                            {selectedDetailedGroupAdmins?.map((admin, index) => (
                                <Avatar sx={{ width: "50px", height: "50px" }} alt={admin.username} src={`${admin.profilePic}`} />
                            ))}
                        </AvatarGroup>
                    </div>
                    <div className='w-[100%] h-[25%]  flex flex-col items-center justify-center ' >
                        <div className='w-[100%] h-[20%] flex justify-center items-center  text-white text-xl italic' >Members</div>
                        <AvatarGroup sx={{ width: "80%", height: "80%", display: 'flex', justifyContent: "center", alignItems: "center" }} max={4}>
                            {selectedDetailedGroupMembers?.map((member, index) => (
                                <Avatar sx={{ width: "50px", height: "50px" }} alt={member.username} src={`${member.profilePic}`} />
                            ))}
                        </AvatarGroup>
                    </div>
                    <div className='w-[100%] h-[25%]  border-t border-white p-5 flex justify-center items-center  ' >
                        <div className='w-[100%] h-[20%] flex flex-col justify-center items-center  text-white text-lg ' > <p> Created On :</p>  <p className='italic' > {new Date(selectedGroups[idx]?.createdAt).getDate()}/{new Date(selectedGroups[idx]?.createdAt).getMonth() + 1}/{new Date(selectedGroups[idx]?.createdAt).getFullYear()}</p></div>
                        <div className='w-[100%] h-[20%] flex flex-col justify-center items-center  text-white text-lg ' > <p> Last updated :</p> <p className='italic' > {new Date(selectedGroups[idx]?.updatedAt).getDate()}/{new Date(selectedGroups[idx]?.updatedAt).getMonth() + 1}/{new Date(selectedGroups[idx]?.updatedAt).getFullYear()}</p></div>
                    </div>
                    <div className='w-[100%] h-[25%] flex-1 flex border-t border-white items-center cursor-pointer signoutdiv ' onClick={handleLeaveGroup} >
                        <ExitToAppIcon style={{ color: "white", width: "25%", height: "50%", padding: "-10px", margin: "0" }} />
                        <p className='text-white text-xl font-light ' >Leave Group</p>
                    </div>

                </div>


            </Drawer>
            {contextMenu.show && <div className={`absolute z-50 bg-black border border-white w-[200px] h-[150px] flex flex-col justify-center items-center rounded-md`} ref={contextMenuRef} onClick={handleContextMenuClose} style={{ top: contextMenu.y, left: contextMenu.x }} >
                <div className={`w-[100%] h-[33%] flex  justify-start cursor-pointer items-center border-b border-white text-white `} onMouseEnter={handleHover} onMouseLeave={handleMouseLeave} onClick={handleViewGroup} >
                    <PersonRoundedIcon sx={{ color: "white", width: "20%", height: "50%" }} className='icon' />
                    <p className='ml-3 text'>View Group</p>
                </div>
                <div className={`w-[100%] h-[34%] flex justify-start cursor-pointer items-center border-white text-white `} onMouseEnter={handleHover} onMouseLeave={handleMouseLeave} onClick={handleUserDelete} >
                    <DeleteIcon sx={{ color: "white", width: "20%", height: "50%" }} className='icon' />
                    <p className='ml-3 text' >Delete Group</p>
                </div>
                <div className={`w-[100%] h-[34%] flex justify-start cursor-pointer items-center border-white text-white `} onMouseEnter={handleHover} onMouseLeave={handleMouseLeave} onClick={handleLeaveGroup} >
                    <ExitToAppIcon sx={{ color: "white", width: "20%", height: "50%" }} className='icon' />
                    <p className='ml-3 text' >Leave Group</p>
                </div>
            </div>}
            <div className='w-[85vw] h-screen flex flex-row overflow-x-hidden overflow-y-hidden ' onClick={() => { if (dispCreateGroupPopUp) { setDispCreateGroupPopUp(false) } }} >
                <div className={`w-[35vw] h-[55vh] border flex-col z-10 bg-black justify-center hidden border-white absolute left-[35%] top-[20%] rounded-lg ${dispCreateGroupPopUp === null ? '' : dispCreateGroupPopUp ? 'appear' : 'disappear'}`} onClick={(e) => e.stopPropagation()} >
                    <form className='w-[100%] h-[100%] relative ' onSubmit={handleCreateGroup}>
                        <div className=' w-[100%] h-[20%] font-semibold  flex text-2xl rounded-lg text-center justify-center items-center text-white'>Create your Group</div>
                        <div className=' w-[100%] h-[20%] font-semibold  flex text-center justify-center items-center text-white'><input type="text" className='bg-black text rounded text-white w-[65%] h-[80%] text-center border border-white outline-none groupNameInput' onChange={(e: any) => setGroupName(e.target.value)} value={groupName} placeholder='Enter your group name' required /></div>
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
                                            <div className='relative w-[30%] h-[100%] flex justify-center items-center border-none'>
                                                <div className='relative w-[65px] h-[65px] border border-white overflow-hidden rounded-full flex flex-center items-center justify-center' >
                                                    {result?.profilePic ? <><img
                                                        src={`${result?.profilePic}`}
                                                        alt="profile"
                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    /></> : <GroupsIcon sx={{ color: "white", width: "70%", height: "70%" }} />}
                                                </div>
                                            </div>
                                            <div className='relative w-[80%] h-[100%] border-none text-white rounded-e-sm '>
                                                <p className=' border-none items-center w-[100%] h-[60%]  rounded-e-2xl pt-2 ml-2 mx-auto font-bold text-lg' key={index}>{result.groupName}</p>
                                                <p className="italic border-none items-center w-[100%] h-[40%]  rounded-e-2xl  ml-2 mx-auto" key={index}>{result.members[1].username} +{result.length - 1}more...</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </> : <>

                            </>}
                            <div className='flex flex-col items-center relative z-10 mt-1 h-[95%] overflow-y-scroll' >
                                {selectedGroups && selectedGroups.length > 0 ? selectedGroups?.map((user, index) => (
                                    <div className='w-[98%] h-[70px] flex border-none mb-3 rounded-sm cursor-pointer  bg-[#1e232c] hover:bg-[#3d3c3c] ' onContextMenu={handleContextMenu} onClick={() => handleGroupClick(index, user.groupName, user.roomId)} >
                                        <div className={`w-[100%] h-[100%] flex border-none mb-3 rounded-sm   bg-[${userClicked === index ? '#3d3c3c' : '#1e232c'}] hover:bg-[#3d3c3c]`}>
                                            <div className='relative w-[30%] h-[100%] flex justify-center items-center border-none'>
                                                <div className='relative w-[65px] h-[65px] border border-white overflow-hidden rounded-full flex flex-center items-center justify-center' >
                                                    {user?.profilePic ? <><img
                                                        src={`${user?.profilePic}`}
                                                        alt="profile"
                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    /></> : <GroupsIcon sx={{ color: "white", width: "70%", height: "70%" }} />}

                                                </div>
                                            </div>
                                            <div className='relative w-[80%] h-[100%] border-none text-white rounded-e-sm '>
                                                <p className=' border-none items-center w-[100%] h-[60%]  rounded-e-2xl pt-2 ml-2 mx-auto font-bold text-lg' key={index}>{user.groupName}</p>
                                                <p className="italic border-none items-center w-[100%] h-[40%]  rounded-e-2xl  ml-2 mx-auto" key={index}>{user.members[1].username}  +{user.members.length} more...</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : <>
                                    <div className='w-[80%] flex justify-center items-center text-white h-[20%] clickHereAnimation2 ' >
                                        <StraightIcon sx={{ color: "white", width: "30%", height: "80%" }} /> Click here to search your groups
                                    </div>
                                </>
                                }
                            </div>
                        </div>

                    </div>
                </div>
                {selectedGroups && selectedGroups.length > 0 ? <>
                    <div className={`flex flex-col w-[100%] h-screen justify-center items-center ${isChatWindowVisible === null ? 'hidden' : isChatWindowVisible ? 'chat-window' : 'chat-window-hidden'} `} >
                        <div className='flex flex-col justify-center items-center w-[100%] h-[85%] relative '>
                            <div className='flex justify-center items-center w-[100%] h-[15%]  ' >
                                <div className=' flex w-[90%] h-[80%] border border-[#1e232c] rounded ' >
                                    <div className='w-[10%] h-[100%]  flex justify-center items-center ' >
                                        <div className='w-[50px] h-[50px] rounded-full border border-white overflow-hidden ' >
                                            {selectedGroups[idx]?.profilePic ? <>
                                                <img
                                                    src={`${selectedGroups[idx]?.profilePic}`}
                                                    alt="profile"
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                />
                                            </> : <>
                                                <GroupsIcon sx={{ color: "white", width: "100%", height: "100%" }} />
                                            </>}
                                        </div>
                                    </div>
                                    <div className='w-[50%] h-[100%]  flex flex-col justify-center items-center ' >
                                        <div className='w-[100%] h-[50%] flex justify-center items-center text-center ' >
                                            <p className='w-[100%] h-[100%] flex justify-start items-center text-center text-white font-bold text-xl mt-3 ' >{selectedGroups[idx]?.groupName}</p>
                                        </div>
                                        <div className='w-[100%] h-[50%] flex justify-center items-center text-center ' >
                                            <p className='w-[100%] h-[100%] flex justify-start items-center text-center  text-white font-thin text-sm italic ' >
                                                {selectedGroups[idx].members && selectedGroups[idx].members.map((user, index) => (
                                                    <p key={index} className="mr-2 ">
                                                        {user.username}{index !== selectedGroups[idx].members.length - 1 && ','}
                                                    </p>
                                                ))}
                                            </p>
                                        </div>
                                    </div>
                                    <MoreVertIcon component="div" sx={{ padding: "0px", width: "30%", cursor: "pointer", height: "90%", color: "white" }} onClick={handleContextMenu} />

                                </div>
                            </div>
                            <div className='relative flex flex-col-reverse w-[90%] h-[85%] border border-[#1e232c] rounded overflow-y-auto ' >
                                {messages && messages.map((msg, index) => (
                                    <div className={`w-[450px] border-none h-[150px] mb-20 mt-2 flex border  ${msg.sender === currentUser.username ? ' ml-auto sender' : ''} `} >
                                        {msg.sender === currentUser.username ? <>
                                            <div className={`w-[fit-content] h-[fit-content] mt-2 mb-2 mr-0  ${msg.sender === currentUser.username ? 'bg-[#3d3c3c] ml-auto rounded-s bubble right ' : 'bg-[#1e232c] rounded-e bubble left '}  text-white flex font-thin text-sm  `}>
                                                {msg.audioURL ? (
                                                    <audio controls src={msg.audioURL} >
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
                                                ) : (<>
                                                    {msg.message}
                                                </>)}
                                            </div>
                                            <div className='rounded-full border border-white w-[40px] h-[40px] mt-auto flex justify-center items-center overflow-hidden ' >
                                                {profilePicPath.profilePicPath && profilePicPath.profilePicPath !== "undefined" ? <> <img src={`${profilePicPath.profilePicPath}`} alt="" /> </> : <>
                                                    <PersonIcon sx={{ borderRadius: "50px", color: "white", width: "35px", height: "35px" }} />
                                                </>}
                                            </div>

                                        </> : <>
                                            <div className='rounded-full flex items-center justify-center w-[40px] h-[40px] overflow-hidden mt-[auto] ' >
                                                {msg?.profilePic?.length > 0 && msg?.profilePic && msg?.profilePic !== "undefined" ? <img src={`${msg?.profilePic}`} alt={msg.sender} /> : <PersonIcon sx={{ border: "1px solid white", borderRadius: "50px", color: "white", width: "35px", height: "35px" }} />}
                                                {/* <PersonIcon sx={{ marginTop: "100%", border: "1px solid white", borderRadius: "50px", color: "white", width: "35px", height: "35px" }} /> */}
                                            </div>
                                            <div className={`w-[fit-content] h-[fit-content] mt-[auto] font-thin text-sm mb-2 border-none ${msg.sender === currentUser.username ? 'bg-[#3d3c3c] ml-auto rounded-s bubble right ' : 'bg-[#1e232c] rounded-e bubble left '}  text-white p-[1.5%] flex font-semibold  `}>
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
                                                        {msg.message}
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
                </> : <>
                    <div className='flex flex-col w-[100%] h-screen  justify-center items-center ' >
                        <img src="/images/no_groups_found2.png" className='w-[70%] h-[85%]  ' alt="" />

                    </div>
                </>}
            </div>



        </>
    )
}
