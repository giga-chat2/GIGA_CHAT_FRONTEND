"use client"
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useCookies } from 'react-cookie'
import './index.css'
import { Multiselect } from 'multiselect-react-dropdown'
import { useParams } from 'next/navigation'
import {ZegoUIKitPrebuilt} from "@zegocloud/zego-uikit-prebuilt"
import {nanoid} from 'nanoid'

export const VideoCallMainComponent: React.FC = () => {
    const [currentUser, setCurrentUser] = useCookies(['username' as string])
    const [emailCookie, setEmailCookie] = useCookies(['email' as string])
    const [selectedUser, setSelectedUser] = useState<object[]>([])
    const [options, setOptions] = useState([])

    const fetchInitialData = async () => {
        try {
            await fetch('http://localhost:4000/getUsernames', {
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
            title: 'Enter Room Name',
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Join',
            showLoaderOnConfirm: true,
            preConfirm: (roomName) => {
                const url = `room/${roomName}`
                window.location.href = url
            },
            allowOutsideClick: () => !Swal.isLoading()
        })
        // const roomName = 'testRoom'
        // const url = `room/${roomName}`
        // window.location.href = url

    }
    const [sharedUsers, setSharedUsers] = useState<object[]>([])
    const [dispCreateGroupPopUp, setDispCreateGroupPopUp] = useState<boolean | null>(null)
    const handleShareLink = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setDispCreateGroupPopUp(false)
        let roomId=nanoid()
        // console.log(sharedUsers)
        try{
            const response = await fetch('http://localhost:4000/shareLink', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ currentUser:currentUser.username, sharedUsers: sharedUsers, roomId:roomId})
            })
            setDispCreateGroupPopUp(false)

        }catch(e){
            console.log(e)
        }
    }

    return (
        <>
            <div className='w-[85vw] h-screen flex flex-row overflow-x-hidden overflow-y-hidden' onClick={() => { if (dispCreateGroupPopUp) { setDispCreateGroupPopUp(false) } }} >
                <div className={`w-[35vw] h-[35vh] border flex-col z-10 bg-black items-center justify-center hidden border-white absolute left-[35%] top-[20%] rounded-lg ${dispCreateGroupPopUp === null ? '' : dispCreateGroupPopUp ? 'appear' : 'disappear'}`} onClick={(e) => e.stopPropagation()} >
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
                <div className='w-[20%] min-w-[20vw] h-[100%] relative border border-white '>
                </div>
                <div className='w-[80%] min-w-[20vw] h-[100%] relative border border-white flex justify-center items-center '>
                    <div className=' w-[80%] h-[80%] rounded-xl  flex justify-center items-center ' >
                        <div className='border border-white w-[80%] h-[80%] text-white flex flex-col justify-center items-center  rounded-xl   ' >
                            <p className='text-xl underline cursor-pointer italic ' onClick={handleRoomJoin} >Join existing call</p>
                            <p>Or</p>
                            <button className='bg-white text-black rounded-full w-[60%] h-[20%] hover:bg-black border hover:text-white hover:border-white text-lg ' onClick={() => { if (dispCreateGroupPopUp === null) { setDispCreateGroupPopUp(true) } else { setDispCreateGroupPopUp(!dispCreateGroupPopUp) } }}  >Start New Call +</button>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}


export const RoomComponent: React.FC = ({userName}) => {
    const params = useParams<{ tag: string; item: string }>()
    const myMeeting = async (element)=>{
      const appID=2010080204
      const serverSecret = 'dec380ae8f61e199d65bfb7bf8f2b964'
    //   const [currentUser, setCurrentUser] = useCookies(['username'])
      const kitToken =  ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, params.roomId[0],userName,userName, 3600);
      const zc = ZegoUIKitPrebuilt.create(kitToken)
      zc.joinRoom({
        container:element,
        scenario:{
          mode:ZegoUIKitPrebuilt.GroupCall,
        },
        showScreenSharingButton: true,
      })
    }
    return (
        <div>
        <div ref={myMeeting} />
      </div>
    )
}