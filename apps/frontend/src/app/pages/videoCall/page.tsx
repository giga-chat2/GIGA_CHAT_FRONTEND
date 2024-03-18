import React from 'react'
import NavBar from '@/components/navbar/NavBar'
import { VideoCallMainComponent } from '@/components/videoCall/VideoCallComponents'

const page = () => {

  return (
    <div className='h-screen w-screen bg-black flex'>
      <NavBar defaultValue={"videoCall"} />
      <VideoCallMainComponent/>
    </div>
  )
}

export default page