import React from 'react'
import NavBar from '@/components/navbar/NavBar'
import { MainComponent } from '@/components/groups/GroupsComponents'

const page = () => {
    return (
        <>
            <div className='h-screen w-screen bg-black flex'>
                <NavBar defaultValue={"groups"} />
                <MainComponent/>
            </div>
        </>
    )
}

export default page