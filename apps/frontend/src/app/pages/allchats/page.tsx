import React from 'react'
import NavBar from '@/components/navbar/NavBar'
import { PopUpCover } from '@/components/allchats/AllChatsComponents'
import { MainComponent } from '@/components/allchats/AllChatsComponents'

const page = () => {

  return (
    <div className='h-screen w-screen bg-black flex'>
      <PopUpCover/>
      <NavBar defaultValue={"allchats"} />
      <MainComponent/>
    </div>
  )
}

export default page