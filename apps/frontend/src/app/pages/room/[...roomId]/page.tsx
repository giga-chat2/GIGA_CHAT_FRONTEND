"use client"
import React from 'react'
import {RoomComponent} from '@/components/videoCall/VideoCallComponents'
import { useCookies } from 'react-cookie'


const page = () => {
  const [currentUser, setCurrentUser] = useCookies(['username'])

  return (
    <RoomComponent userName={currentUser.username} />
  )
}

export default page