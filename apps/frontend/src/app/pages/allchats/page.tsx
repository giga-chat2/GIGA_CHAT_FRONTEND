"use client"
import React from 'react'
import NavBar from '@/components/navbar/NavBar'
import { PopUpCover } from '@/components/allchats/AllChatsComponents'
import { MainComponent } from '@/components/allchats/AllChatsComponents'
import { useCookies } from 'react-cookie'
const page = () => {
  const [mobileView, setMobileView] = useCookies(['mobileView'])

  return (
    <>
      <PopUpCover />
      {mobileView.mobileView ? <>
        <div className='h-[94vh] py-3 w-screen bg-black flex flex-col '>
          <MainComponent />
          <NavBar defaultValue={"allchats"} />
        </div>
      </> : <>
        <div className='h-screen w-screen bg-black flex'>
        <NavBar defaultValue={"allchats"} />
          <MainComponent />
        </div>
      </>}
    </>
  )
}


export default page