import React from 'react'
import NavBar from '@/components/navbar/NavBar'
import { MainComponent } from '@/components/archieve/ArchieveComponents'

const page = () => {
  return (
    <>
      <div className='h-screen w-screen bg-black flex'>
        <NavBar defaultValue={"archieved"} />
        <MainComponent />
      </div>
    </>
  )
}

export default page