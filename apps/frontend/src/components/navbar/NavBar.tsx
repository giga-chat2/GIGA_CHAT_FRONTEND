"use client"
import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import ForumIcon from '@mui/icons-material/Forum';
import GroupsIcon from '@mui/icons-material/Groups';
import ArchiveIcon from '@mui/icons-material/Archive';
import PsychologyIcon from '@mui/icons-material/Psychology';
import VideoChatIcon from '@mui/icons-material/VideoChat';
import SettingsIcon from '@mui/icons-material/Settings';
import './index.css'
import Link from 'next/link';
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Swal from 'sweetalert2'
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { useRouter } from 'next/navigation'


const NavBar = ({ defaultValue }) => {
  const [activeTab, setActiveTab] = useState<string>(defaultValue);
  const [isOpen, setIsOpen] = React.useState(false)
  const [emailCookie, setEmailCookie] = useCookies(['email' as string])
  const [currentUser, setCurrentUser] = useCookies(['username'])
  const [profilePicPath, setProfilePicPath] = useCookies(['profilePicPath'])
  const [retrievedProfilePic, setRetrievedProfilePic] = useState<boolean>(false)


  useEffect(() => {
    console.log("useefectse ", profilePicPath)
    if (profilePicPath.profilePicPath !== "undefined") {
      setRetrievedProfilePic(true)
    }
  }, [])
  console.log(profilePicPath.profilePicPath)



  const [userName, setUserName] = useState<string>(currentUser.username)
  const [email, setEmail] = useState<string>(emailCookie.email)

  const router = useRouter();


  const handleTabClick = async (tab: string) => {
    if (tab === "settings") {
      setIsOpen((prevState) => !prevState)
      return
    } else if (tab === "archieved") {
      try {
        const response = await axios.post('http://localhost:4000/getArchivedUsers', { username: currentUser.username })
        const data = response.data
        console.log(data)
        if (data.archivedUsers.length > 0) {
          router.push('/pages/archieved')
          return
          // window.location.href = "/pages/archieve";
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'No Archived Chats Found!',
          })
          return;
        }
      } catch (err) {
        console.log(err)
      }
    }
    setActiveTab(tab);
    router.push(`/pages/${tab}`)
  };

  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);


  const handleIconClick = () => {
    fileInputRef.current.click();
  };
  // useEffect(() => {
  //   axios.get('http://localhost:4000/getprofilePic').then((response) => {
  //     console.log(response)
  //     setSelectedImage(response.data)
  //     // const contentType = response.headers['content-type'];
  //     // const imageBlob = new Blob([response.data], { type: 'image/png' });
  //     // const imageUrl = URL.createObjectURL(imageBlob);
  //     // console.log(imageUrl)
  //     // setSelectedImage(imageUrl);
  //     // setProfilePicPath('profilePicPath', response.data.profilePicPath)
  //   })
  // }, [])


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const selectedFile = e.target.files[0];

    const reader = new FileReader();
    console.log(1, selectedFile, e.target.result)
    reader.onload = async (event: ProgressEvent<FileReader>) => {
      console.log(2)
      setSelectedImage(event.target.result);
      const formData = new FormData();
      formData.append('email', emailCookie.email)
      formData.append('profilePic', selectedFile);


      const response = await axios.post('http://localhost:4000/uploadProfilePic', formData);
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
    };
    if (selectedFile) {
      reader.readAsDataURL(selectedFile);
    }
  };


  const handleSignOut = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to sign out",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Sign out'
    }).then((result) => {
      if (result.isConfirmed) {
        // localStorage.removeItem("user");
        window.location.href = "/pages/auth";
      }
    })
  }




  return (
    <>
      <div className='w-[15vw] h-screen bg-black flex flex-col items-center'>
        <div className='w-[100%] h-[10%] flex  items-center' >
          <Image src="/images/giga-coder-logo.png" width={150} height={150} alt="" className=' ml-5' />
        </div>

        <div className='w-[100%] h-[10%] flex items-center px-5  parent '>
          <Link href="/pages/allchats" className='w-[100%] h-[100%] flex items-center ' >
            <ForumIcon sx={{ color: "#666666", width: "30%", height: "30%", marginBottom: "1%" }} className={`child  ${activeTab === "allchats" ? 'active' : ''} `} />
            <p className={`text-[#666666] font-thin child ${activeTab === "allchats" ? "active" : ""} `} >All Chats</p>
          </Link>
        </div>

        <div className='w-[100%] h-[10%] flex items-center px-5 parent' >
          <Link href="/pages/groups" className='w-[100%] h-[100%] flex items-center ' >
            <GroupsIcon sx={{ color: "#666666", width: "30%", height: "30%", marginBottom: "1%" }} className={`child  ${activeTab === "groups" ? 'active' : ''} `} />
            <p className={`text-[#666666] font-thin child ${activeTab === "groups" ? "active" : ""} `} >Groups</p>
          </Link>
        </div>
        <div className='w-[100%] h-[10%] flex items-center px-5 parent' onClick={() => handleTabClick("archieved")} >
          {/* <Link href="/pages/archieve" className='w-[100%] h-[100%] flex items-center ' > */}
          <ArchiveIcon sx={{ color: "#666666", width: "30%", height: "30%", marginBottom: "1%" }} className={`child  ${activeTab === "archieved" ? 'active' : ''} `} />
          <p className={`text-[#666666] font-thin child ${activeTab === "archieved" ? "active" : ""} `}>Archived</p>
          {/* </Link> */}
        </div>
        <div className='w-[100%] h-[10%] flex items-center px-5 parent' >
          <Link href="/pages/askAi" className='w-[100%] h-[100%] flex items-center ' >
            <PsychologyIcon sx={{ color: "#666666", width: "30%", height: "30%", marginBottom: "1%" }} className={`child  ${activeTab === "askAi" ? 'active' : ''} `} />
            <p className={`text-[#666666] font-thin child ${activeTab === "askAi" ? "active" : ""} `}>
              Ask AI</p>
          </Link>
        </div>
        <div className='w-[100%] h-[10%] flex items-center px-5 parent' onClick={() => handleTabClick("videoCall")} >
          <Link href="/pages/videoCall" className='w-[100%] h-[100%] flex items-center ' >
            <VideoChatIcon sx={{ color: "#666666", width: "30%", height: "30%" }} className={`child  ${activeTab === "videoCall" ? 'active' : ''} `} />
            <p className={`text-[#666666] font-thin child ${activeTab === "videoCall" ? "active" : ""} `}>Video Call</p>
          </Link>

        </div>
        <div className='w-[100%] h-[10%] flex items-center px-5 mt-auto parent' onClick={() => handleTabClick("settings")} >
          <SettingsIcon sx={{ color: "#666666", width: "30%", height: "30%" }} className={`child  ${activeTab === "settings" ? 'active' : ''} `} />
          <p className={`text-[#666666] font-thin child ${activeTab === "settings" ? "active" : ""} `} >
            Settings</p>

        </div>



      </div >

      <Drawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        direction='right'
        className='drawer'
        style={{ width: "25vw", backgroundColor: "#1e232c" }}
      >
        <div className='border-none w-[100%] h-[30%] flex flex-col justify-center items-center ' >
          <div className='w-[150px] h-[150px] border border-white overflow-hidden rounded-full flex justify-center items-center cursor-pointer ' onClick={handleIconClick} >
            {/* {profilePicPath.profilePicPath ? */}
            {retrievedProfilePic ? <>

              <img
                src={selectedImage ? selectedImage : `http://localhost:4000/getprofilePic/${profilePicPath.profilePicPath}`}
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

            {/* //   :
              //   <PersonIcon style={{ color: "white", width: "70%", height: "70%" }} />
              // } */}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          <p className='text-center text-white mt-2 font-semibold text-medium font-sans ' >Upload your profile picture</p>
        </div>

        <div className='w-[100%] h-[70%] border-none '>
          <div className='w-[100%] h-[10%] flex justify-center items-center border-none input-group '>
            <input type="text" required value={userName} onChange={(e) => setUserName(e.target.value)} />
            <label >Change UserName</label>
          </div>
          <div className='w-[100%] h-[10%] flex justify-center items-center border-none input-group '>
            <input type="text" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <label >Change Email</label>
          </div>
          <div className='w-[100%] h-[10%] flex justify-center items-center border-none input-group '>
            <button className='w-[92%] h-[90%] text-[#1e232c] bg-white font-sans changeDetailBtn rounded ' >Submit</button>
          </div>
          <div className='w-[100%] h-[30%] border-t flex flex-col  ' >
            <div className='w-[100%] flex flex-col justify-center items-center h-[40%] border-none text-center text-white ' >
              <p>Our Socials</p>

            </div>
            <div className='flex justify-center items-center w-[100%] h-[60%] ' >
              <a className="social-icon" id="facebookIcon" onClick={() => { window.location.href = 'https://www.facebook.com/aditya.sakpal.79677' }}>
                <i className="fab fa-facebook-f" />
              </a>
              <a className="social-icon" id="twitterIcon" onClick={() => { window.location.href = 'https://twitter.com/giga_coder' }}>
                <i className="fa-brands fa-x-twitter" />
              </a>
              <a className="social-icon" id="instagramIcon" onClick={() => { window.location.href = 'https://www.instagram.com/aditya_sakpal123/' }}>
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a className="social-icon" id="linkedinIcon" onClick={() => { window.location.href = 'https://www.linkedin.com/in/aditya-sakpal-02270325b/' }}>
                <i className="fa-brands fa-linkedin"></i>
              </a>
            </div>
          </div>
          <div className='w-[100%] h-[20%] flex  items-center cursor-pointer  border-t border-white signoutdiv ' onClick={handleSignOut} >
            <ExitToAppIcon style={{ color: "white", width: "15%", height: "40%", padding: "-10px", margin: "0" }} />
            <p className='text-white text-lg font-light ' >Sign-Out</p>
          </div>

        </div>
      </Drawer>
    </>
  )
}

export default NavBar;