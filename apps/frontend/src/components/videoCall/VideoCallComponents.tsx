// @ts-nocheck
"use client"
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useCookies } from 'react-cookie'
import './index.css'
import { Multiselect } from 'multiselect-react-dropdown'
import { useParams } from 'next/navigation'
// import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt"
import { nanoid } from 'nanoid'
import { io } from 'socket.io-client';
import axios from 'axios';
import VideoChatIcon from '@mui/icons-material/VideoChat';
import VideocamIcon from '@mui/icons-material/Videocam';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { useSession } from 'next-auth/react';

export const VideoCallMainComponent: React.FC = () => {
    const [currentUser, setCurrentUser] = useCookies(['username' as string])
    const [emailCookie, setEmailCookie] = useCookies(['email' as string])
    const [selectedUser, setSelectedUser] = useState<object[]>([])
    const [options, setOptions] = useState([])

    const session = useSession()

    useEffect(() => {
        if (session?.status === 'authenticated') {
            setEmailCookie('email', session?.data?.user?.email, { path: '/' })
        }
        else if(session?.status === 'unauthenticated'){
            window.location.href = '/pages/auth'
        }
    },[])


    const socket = io('https://giga-chat-socket.onrender.com')
    const [meetings, setMeetings] = useState<object[]>([])
    const fetchMeetings = async () => {
        try {
            const response = await axios.post('https://giga-chat-2-backend.vercel.app/getMeetings', { username: currentUser.username })
            // console.log(response)
            setMeetings(response.data.meetings)
        } catch (e) { console.log(e) }
    }
    useEffect(() => {
        fetchMeetings()
    }, [])

    const fetchInitialData = async () => {
        try {
            await fetch('https://giga-chat-2-backend.vercel.app/getUsernames', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: emailCookie?.email })
            }).then(res => res.json()).then(data => {
                setSelectedUser(data.selectedUsers)
                setOptions(data.selectedUsers)
                // setSelectedUser(data.selectedUsers.map(user => ({ ...user, isChecked: false })));
            })
        } catch (e) {
            console.log(e)
        }
    }
    useEffect(() => {
        fetchInitialData()
    }, [])



    const handleRoomJoin = async () => {
        Swal.fire({
            title: 'Enter Room ID ',
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Join',
            showLoaderOnConfirm: true,
            preConfirm: (roomName) => {
                const url = `room/${roomName}`
                // window.location.href = url
                window.open(url, '_blank');
            },
            allowOutsideClick: () => !Swal.isLoading()
        })

    }
    const [sharedUsers, setSharedUsers] = useState<object[]>([])
    const [dispCreateGroupPopUp, setDispCreateGroupPopUp] = useState<boolean | null>(null)
    const [prevRoomId, setPrevRoomId] = useState<string>('')
    const handleShareLink = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setDispCreateGroupPopUp(false)
        let roomId = nanoid()
        // console.log(sharedUsers)
        try {
            if (socket) {
                socket.emit("joinRoom", roomId)
                sharedUsers.forEach(user => {
                    console.log(user)
                    console.log("before")
                    socket.emit("sendMessage", { message: `Let's meet my friend : https://giga-chat-frontend-seven.vercel.app/pages/room/${roomId}`, room_Id: user?.roomId, email: emailCookie.email, sender: currentUser, receiver: user.username });
                    console.log("after")
                })
            }
            const response = await fetch('https://giga-chat-2-backend.vercel.app/shareLink', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ currentUser: currentUser.username, sharedUsers: sharedUsers, roomId: roomId })
            })
            console.log("Before")
            window.open(`https://giga-chat-frontend-seven.vercel.app/pages/room/${roomId}`, '_blank');
            setDispCreateGroupPopUp(false)
            console.log('redirect hona chahiye tha')
        } catch (e) {
            console.log(e)
        }
    }
    const [userClicked, setUserClicked] = useState<number | undefined>()
    const handleChatClicked = async (idx: number) => {
        setUserClicked(idx)
    }
    const formatTime = (timeString) => {
        // Split the time string by ':'
        const timeParts = timeString.split(':');
        // Extract hours, minutes, and AM/PM part
        const hours = parseInt(timeParts[0]);
        const minutes = parseInt(timeParts[1]);
        const ampm = timeParts[2]?.split(' ')[1]; // Extracting 'PM' or 'AM'

        // Construct formatted time string
        const formattedTime = `${hours}:${minutes}${ampm}`;

        return formattedTime;
    };
    return (
        <>
            <div className='w-[85vw] h-screen flex flex-row overflow-x-hidden overflow-y-hidden' onClick={() => { if (dispCreateGroupPopUp) { setDispCreateGroupPopUp(false) } }} >
                <div className={`w-[35vw] h-[35vh] border flex-col z-10 bg-black items-center justify-center hidden border-white absolute left-[35%] top-[30%] rounded-lg ${dispCreateGroupPopUp === null ? '' : dispCreateGroupPopUp ? 'appear' : 'disappear'}`} onClick={(e) => e.stopPropagation()} >
                    <form className='w-[100%] h-[100%] relative ' onSubmit={handleShareLink}>
                        <div className='flex flex-col justify-center items-center h-full'>
                            <div className=' w-[100%] h-[20%]  font-semibold  flex text-2xl rounded-lg text-center justify-center items-center text-white'>Share Link with your friends</div>
                            <div className=' w-[100%] h-[20%] mt-5 mb-5 font-semibold  flex text-center justify-center items-center text-white'>
                                <Multiselect options={options} placeholder='Select Users' displayValue='username' className='multi-select' onSelect={(selectedList, selectedItem) => { setSharedUsers(selectedList) }} onRemove={(selectedList, removedItem) => { setSharedUsers(selectedList) }}
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
                            <div className=' w-[100%] h-[30%] font-semibold flex text-center justify-center items-center text-white' >
                                <button type='submit' className='width-[10%] h-[50%] bg-black border border-white createGrpButton rounded-3xl ' >Submit</button>
                            </div>
                        </div>
                    </form>
                </div>
                <div className='w-[20vw] min-w-[20vw] h-[100%] relative '>
                    <div className='w-[100%] h-[90%] relative'>
                        <div className='w-[100%] h-[7%] mt-6 flex justify-center items-center p-1'>
                            <VideoChatIcon sx={{ color: "#fff", width: "20%", height: "70%", padding: "0", marginBottom: "1%" }} />

                            <p className='w-[100%] h-[90%] text-xl font-semibold text-white ' >Previous Meetings</p>
                        </div>
                        <div className='w-[100%] h-[100%] overflow-y-scroll searchResults '>
                            <div className='flex flex-col items-center w-[100%] relative z-10 mt-1 h-[95%] overflow-y-scroll' >
                                {meetings.length > 0 ? meetings.map((chat, idx) => (
                                    <div className={`w-[100%] h-[70px] flex mb-2 p-2 cursor-pointer justify-start rounded-md items-center mt-1 bg-[${userClicked === idx ? '#3d3c3c' : '#1e232c'}] hover:bg-[#3d3c3c] hover:text-white`} onClick={() => handleChatClicked(idx)} >
                                        <div className='w-[20%] h-[100%] flex justify-center  items-center ' >
                                            <VideocamIcon sx={{width:"60%",height:"60%",color:"white"}} />
                                        </div>
                                        <div className='w-[70%] h-[100%] ml-2 flex flex-col justify-center items-center ' >
                                            <p className='text-white w-[100%] h-[80%] flex justify-start items-center text-xl font-bold ' >{chat?.date}</p>
                                            <p className='text-white w-[100%] h-[20%] flex justify-start italic mb-2 '> {formatTime(chat?.startTime)} - {formatTime(chat?.endTime)} </p>
                                        </div>
                                    </div>
                                )) : <>
                                <div className='w-[80%] flex flex-col justify-center items-center text-white h-[20%] clickHereAnimation4 ' >
                                        <TrendingFlatIcon sx={{ color: "white", width: "30%", height: "50%" }} /> Create/Join your first meeting
                                    </div>
                                </>}
                            </div>
                        </div>

                    </div>
                </div>
                <div className='w-[80%] min-w-[20vw] h-[100%] relative flex justify-center items-center '>
                    <div className=' w-[80%] h-[80%] rounded-xl  flex justify-center items-center ' >
                        <div className='border border-white w-[80%] h-[80%] text-white flex flex-col justify-center items-center  rounded-xl   ' >
                            <p className='text-xl underline cursor-pointer italic ' onClick={handleRoomJoin} >Join existing call</p>
                            <p>Or</p>
                            <button className='bg-white text-black rounded-full w-[40%] h-[15%] hover:bg-black border hover:text-white hover:border-white text-lg ' onClick={() => { if (dispCreateGroupPopUp === null) { setDispCreateGroupPopUp(true) } else { setDispCreateGroupPopUp(!dispCreateGroupPopUp) } }}  >Start New Call +</button>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

interface IMyProps {
    userName: string,
}

export const RoomComponent: React.FC<IMyProps> = ({ userName }) => {
    const params = useParams<{ tag: string; item: string }>()
    const [meetingId, setMeetingId] = useState<string>('')

    const onJoinMeet = async () => {
        setMeetingId(params.roomId[0])
        try {
            const response = await axios.post('https://giga-chat-2-backend.vercel.app/enterStartMeet', { username: userName, meetingId: params.roomId[0], startTime: new Date().toLocaleTimeString(), date: new Date().toLocaleDateString() })
            console.log(response)
        } catch (e) { console.log(e) }
    }
    const onLeaveMeet = async () => {
        try {
            const response = await axios.post('https://giga-chat-2-backend.vercel.app/enterEndMeet', { username: userName, meetingId: params.roomId[0], endTime: new Date().toLocaleTimeString() })
            console.log(response)
        } catch (e) { console.log(e) }
    }
    const myMeeting = async (element) => {
        const { ZegoUIKitPrebuilt } = await import("@zegocloud/zego-uikit-prebuilt");
        const appID = 2123486985
        const serverSecret = 'ce2ab5d43ff38950e8a8c63170ac84b2'
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, params.roomId[0], userName, userName, 3600);
        const zc = ZegoUIKitPrebuilt.create(kitToken)
        zc.joinRoom({
            container: element,
            scenario: {
                mode: ZegoUIKitPrebuilt.GroupCall,
            },
            showScreenSharingButton: true,
            onJoinRoom: () => { onJoinMeet() },
            onLeaveRoom: () => { onLeaveMeet() },

            // onInRoomMessageReceived: (messageInfo) => { console.log(messageInfo.fromUser.userName, messageInfo.message) }
        })
    }


    return (
        <>
            <div style={{ height: "100vh", width: "100vw" }} >
                <div style={{ height: "100vh", width: "100vw" }} ref={myMeeting} />
            </div>
        </>
    )
}
