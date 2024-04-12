"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {MainComponent} from '@/components/UserPage/UserPageComponents'

function page() {

  const params = useParams<{ roomId:string,username: string }>()
  console.log(params)
  const roomId = params.roomId
  const username = params.username

  return (
    <>
      <MainComponent roomId={roomId} username={username} />
    </>
  )
}




export default page