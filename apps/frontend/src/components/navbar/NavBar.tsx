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
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import { addToOnlineUsers, removeFromOnlineUsers } from '../allchats/AllChatsComponents';

const NavBar = ({ defaultValue }) => {
  const [activeTab, setActiveTab] = useState<string>(defaultValue);
  const [isOpen, setIsOpen] = React.useState(false)
  const [emailCookie, setEmailCookie] = useCookies(['email' as string])
  const [currentUser, setCurrentUser] = useCookies(['username' as string])
  const [profilePicPath, setProfilePicPath] = useCookies(['profilePicPath'])
  const [retrievedProfilePic, setRetrievedProfilePic] = useState<boolean>(false)
  const [mobileView, setMobileView] = useCookies(['mobileView'])


  useEffect(() => {
    console.log("useefectse ", profilePicPath)
    if (profilePicPath.profilePicPath !== "undefined" && profilePicPath.profilePicPath !== undefined && profilePicPath.profilePicPath !== "") {
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
      console.log("archieved")
      try {
        const response = await axios.post('https://giga-chat-2-backend.vercel.app/getArchivedUsers', { username: currentUser.username })
        const data = response.data
        console.log(data)
        if (data.archivedUsers && data.archivedUsers.length > 0) {
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
  //   axios.get('https://giga-chat-2-backend.vercel.app/getprofilePic').then((response) => {
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


      const response = await axios.post('https://giga-chat-2-backend.vercel.app/uploadProfilePic', formData);
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
  const [aiSuggestions, setAiAuggestions] = useCookies(['aiSuggestions'])
  const [isAISuggestions, setIsAISuggestions] = useState<boolean>(aiSuggestions.aiSuggestions)

  const handleAiSuggestions = async () => {
    setAiAuggestions('aiSuggestions', !isAISuggestions, { path: '/' })
    setIsAISuggestions(!isAISuggestions)
    try {
      const response = await axios.post('https://giga-chat-2-backend.vercel.app/updateAISuggestions', { currentUsername: currentUser.username })
    } catch (err) {
      console.log(err)
    }
  };
  const [displayStatus, setDisplayStatus] = useCookies(['dispStatus' as string])
  const [dispStatus, setDispStatus] = useState<boolean>(displayStatus.dispStatus)
  const handleDispStatus = async () => {
    if (!dispStatus) {
      console.log("add wala")
      addToOnlineUsers(!dispStatus, currentUser?.username)
    } else {
      console.log("remove wala")
      removeFromOnlineUsers(!dispStatus, currentUser?.username)
    }
    setDisplayStatus('displayStatus', !dispStatus, { path: '/' })
    setDispStatus(!dispStatus)
    try {
      await axios.post('https://giga-chat-2-backend.vercel.app/updateDisplayStatus', { currentUsername: currentUser.username })
    } catch (err) {
      console.log(err)
    }
  }

  const inputRefs = Array.from({ length: 4 }, () => useRef(null));
  const [enteredVerificationCode, setEnteredVerificationCode] = useState('');
  const handlePaste = (ev: ClipboardEvent) => {
    if ((ev.target as HTMLInputElement)?.localName !== 'input') return;
    ev.preventDefault();
    let paste = (ev.clipboardData || window.clipboardData).getData('text');
    paste = paste.toUpperCase();
    let inputs = inputRefs.map((ref) => ref.current);
    if (paste.length !== inputs.length) return; // handle as you want
    setEnteredVerificationCode(paste);
    inputs.forEach((input, index) => {
      input?.focus();
      input.value = paste[index];
    });
  };

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  const handleInput = (e, index) => {
    const value = e.target.value.toUpperCase();
    setEnteredVerificationCode(prevState => {
      const newCode = prevState.split('');
      newCode[index] = value;
      return newCode.join('');
    });

    if (value === '') {
      inputRefs[index - 1]?.current?.focus();
    } else {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const inputElements = [0, 1, 2, 3].map((index) => (
    <input
      key={index}
      ref={inputRefs[index]}
      type='text'
      className='code__input'
      autoFocus={index === 0}
      maxLength={1}
      value={enteredVerificationCode[index] || ''}
      onChange={(e) => handleInput(e, index)}
    />
  ));

  const [dispCodeDiv, setDispCodeDiv] = useState<boolean>(false)
  const [hashedVerificationCode, setHashedVerificationCode] = useState<string>('')

  const handleEmailChange = async () => {
    if (!dispCodeDiv) {


      if (email === emailCookie.email) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Please enter a new email!',
        })
        return
      } else if (email === "") {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Please enter a email!',
        })
        return
      } else if (!email.includes('@') || !email.includes('.')) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Please enter a valid email!',
        })
        return
      } else {
        setDispCodeDiv(true)
        try {
          const response = await axios.post('https://giga-chat-2-backend.vercel.app/sentCode', { email: email })
          if (response.status === 200) {
            setHashedVerificationCode(response.data.verificationCode)
          }
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
            title: "Verification Code Sent Successfully!"
          });
        } catch (err) {
          console.log(err)
        }
      }
    } else {
      if (enteredVerificationCode.length !== 4) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Please enter a valid verification code!',
        })
        return
      } else {
        try {
          const response = await axios.post('https://giga-chat-2-backend.vercel.app/updateEmail', { oldEmail: emailCookie.email, newEmail: email, verificationCode: enteredVerificationCode, hashedVerificationCode: hashedVerificationCode })
          console.log(response.status)
          if (response.status === 200) {
            setDispCodeDiv(false)
            setEmailCookie('email', email, { path: '/' })
            Swal.fire({
              icon: 'success',
              title: 'Email Updated Successfully!',
            })
          }
          else if (response.status === 201) {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Email already in use by some other user!',
            })
          }
          else if (response.status === 202) {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Invalid Verification Code!',
            })
          }
        } catch (err) {
          console.log(err)
        }
      }
      return
    }
  }


  return (
    <>
      {!mobileView.mobileView ? <>
        <div className='w-[15vw] h-screen bg-black flex flex-col items-center'>
          <div className='w-[100%] h-[10%] flex  items-center' >
            <Image src="/images/giga-coder-logo.png" width={150} height={150} alt="" className=' ml-5' />
          </div>
          <Link href="/pages/allchats" className='w-[100%] h-[10%] flex items-center ' >
            <div className='w-[100%] h-[100%] flex items-center px-5  parent ' >
              <ForumIcon sx={{ color: "#666666", width: "30%", height: "30%", marginBottom: "1%" }} className={`child  ${activeTab === "allchats" ? 'active' : ''} `} />
              <p className={`text-[#666666] font-thin child ${activeTab === "allchats" ? "active" : ""} `} >All Chats</p>
            </div>
          </Link>
          <Link href="/pages/groups" className='w-[100%] h-[10%] flex items-center ' >
            <div className='w-[100%] h-[100%] flex items-center px-5 parent' >
              <GroupsIcon sx={{ color: "#666666", width: "30%", height: "30%", marginBottom: "1%" }} className={`child  ${activeTab === "groups" ? 'active' : ''} `} />
              <p className={`text-[#666666] font-thin child ${activeTab === "groups" ? "active" : ""} `} >Groups</p>
            </div>
          </Link>

          <div className='w-[100%] h-[10%] flex items-center px-5 parent' onClick={() => handleTabClick("archieved")} >
            {/* <Link href="/pages/archieve" className='w-[100%] h-[100%] flex items-center ' > */}
            <ArchiveIcon sx={{ color: "#666666", width: "30%", height: "30%", marginBottom: "1%" }} className={`child  ${activeTab === "archieved" ? 'active' : ''} `} />
            <p className={`text-[#666666] font-thin child ${activeTab === "archieved" ? "active" : ""} `}>Archived</p>
            {/* </Link> */}
          </div>
          <Link href="/pages/askAi" className='w-[100%] h-[10%] flex items-center ' >

            <div className='w-[100%] h-[100%] flex items-center px-5 parent' >
              <PsychologyIcon sx={{ color: "#666666", width: "30%", height: "30%", marginBottom: "1%" }} className={`child  ${activeTab === "askAi" ? 'active' : ''} `} />
              <p className={`text-[#666666] font-thin child ${activeTab === "askAi" ? "active" : ""} `}>
                Ask AI</p>
            </div>
          </Link>
          <Link href="/pages/videoCall" className='w-[100%] h-[10%] flex items-center ' >

            <div className='w-[100%] h-[100%] flex items-center px-5 parent' onClick={() => handleTabClick("videoCall")} >
              <VideoChatIcon sx={{ color: "#666666", width: "30%", height: "30%" }} className={`child  ${activeTab === "videoCall" ? 'active' : ''} `} />
              <p className={`text-[#666666] font-thin child ${activeTab === "videoCall" ? "active" : ""} `}>Video Call</p>

            </div>
          </Link>

          <div className='w-[100%] h-[10%] flex items-center px-5 mt-auto parent' onClick={() => handleTabClick("settings")} >
            <SettingsIcon sx={{ color: "#666666", width: "30%", height: "30%" }} className={`child  ${activeTab === "settings" ? 'active' : ''} `} />
            <p className={`text-[#666666] font-thin child ${activeTab === "settings" ? "active" : ""} `} >
              Settings</p>

          </div>
        </div >
      </> : <>
        <div className='w-[100%] h-[10%] flex justify-center items-center border-t border-white ' >
          <Link href="/pages/allchats" className='w-[20%] h-[100%] flex items-center ' >
            <div className='w-[100%] h-[100%] flex flex-col justify-center items-center px-5  parent ' >
              <ForumIcon sx={{ color: "#666666", width: "1.5rem", height: "1.5rem", marginBottom: "1%" }} className={`child  ${activeTab === "allchats" ? 'active' : ''} `} />
              <p className={`text-[#666666] w-[60px] text-center font-thin text-xs child ${activeTab === "allchats" ? "active" : ""} `} >All Chats</p>
            </div>
          </Link>
          <Link href="/pages/groups" className='w-[20%] h-[100%] flex items-center ' >
            <div className='w-[100%] h-[100%] flex flex-col justify-center items-center px-5 parent' >
              <GroupsIcon sx={{ color: "#666666", width: "1.5rem", height: "1.5rem", marginBottom: "1%" }} className={`child  ${activeTab === "groups" ? 'active' : ''} `} />
              <p className={`text-[#666666] w-[50px] text-center font-thin text-xs child ${activeTab === "groups" ? "active" : ""} `} >Groups</p>
            </div>
          </Link>
          <Link href="" className='w-[20%] h-[100%] flex items-center ' >
            <div className='w-[100%] h-[100%] flex flex-col justify-center items-center px-5 parent' onClick={() => handleTabClick("archieved")} >
              <ArchiveIcon sx={{ color: "#666666", width: "1.5rem", height: "1.5rem", marginBottom: "1%" }} className={`child  ${activeTab === "archieved" ? 'active' : ''} `} />
              <p className={`text-[#666666] w-[50px] text-center font-thin text-xs child ${activeTab === "archieved" ? "active" : ""} `}>Archived</p>
            </div>
          </Link>
          <Link href="/pages/askAi" className='w-[20%] h-[100%] flex items-center ' >
            <div className='w-[100%] h-[100%] flex flex-col justify-center items-center px-5 parent' >
              <PsychologyIcon sx={{ color: "#666666", width: "1.5rem", height: "1.5rem", marginBottom: "1%" }} className={`child  ${activeTab === "askAi" ? 'active' : ''} `} />
              <p className={`text-[#666666] w-[50px] text-center font-thin text-xs child ${activeTab === "askAi" ? "active" : ""} `}>
                Ask AI</p>
            </div>
          </Link>
          <Link href="/pages/videoCall" className='w-[20%] h-[100%] flex items-center ' >
            <div className='w-[100%] h-[100%] flex flex-col justify-center items-center px-5 parent ' onClick={() => handleTabClick("videoCall")} >
              <VideoChatIcon sx={{ color: "#666666", width: "1.5rem", height: "1.5rem" }} className={`child  ${activeTab === "videoCall" ? 'active' : ''} `} />
              <p className={`text-[#666666] w-[60px] text-center font-thin text-xs child ${activeTab === "videoCall" ? "active" : ""} `}>Video Call</p>
            </div>
          </Link>
          {/* <div className='w-[16%] h-[100%] flex flex-col items-center px-5 parent border border-white' onClick={() => handleTabClick("settings")} >
            <SettingsIcon sx={{ color: "#666666", width: "1.5rem", height: "1.5rem" }} className={`child  ${activeTab === "settings" ? 'active' : ''} `} />
            <p className={`text-[#666666] w-[160%] font-thin text-xs child ${activeTab === "settings" ? "active" : ""} `} >
              Settings</p>
            </div> */}

        </div>
      </>}

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
                src={selectedImage ? selectedImage : `${profilePicPath.profilePicPath}`}
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

        <div className='w-[100%] h-[70%] border-none flex flex-col '>
          <div className={`w-[100%] h-[10%] flex justify-center items-center border-none input-group ${dispCodeDiv ? 'animate-up' : ''} `}>
            <input type="text" required value={userName} onChange={() => setUserName(userName)} />
            <label >UserName</label>
          </div>
          <div className={`w-[100%] h-[10%] z-20 flex justify-center items-center border-none input-group ${dispCodeDiv ? 'animate-up' : ''} `}>
            <input type="text" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <label >Change Email</label>
          </div>
          <div className='verification_code_container' >
            <div id="codeForm" >
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type='number'
                  className='code__input'
                  autoFocus={index === 0}
                  maxLength={1}
                  onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const target = e.target as HTMLInputElement;
                    target.value = e.target.value.toUpperCase();

                    setEnteredVerificationCode(inputRefs.map(ref => ref.current?.value).join(''));

                    if (target.value === '') {
                      inputRefs[index - 1]?.current?.focus();
                    } else {
                      inputRefs[index + 1]?.current?.focus();
                    }
                  }}
                />
              ))}
            </div>
          </div>
          <div className={`w-[100%] h-[10%] flex justify-center items-center border-none input-group2 ${dispCodeDiv ? 'animate-down' : ''} `}>
            <button className='w-[92%] h-[90%] text-[#1e232c] bg-white font-sans changeDetailBtn rounded ' onClick={handleEmailChange} >{dispCodeDiv ? 'Submit Code' : 'Change Email'}</button>
          </div>
          <div className='w-[100%] h-[20%] border-t border-white  justify-center items-center flex flex-col ' >
            <div className='w-[100%] h-[50%] flex justify-center items-center ' >
              <div className='w-[100%] h-[100%] flex items-center ml-[15%] ' >
                <TipsAndUpdatesIcon sx={{ padding: "0%", color: "white", width: "15%", height: "50%" }} />
                <p className='text-white text-2xl font-semibold' >AI-Suggestions</p>
                <button className=" toggle-switch1" onClick={handleAiSuggestions}>
                  <input type="checkbox" checked={isAISuggestions} onChange={() => { }} />
                  <span className="slider1 round1"></span>
                </button>

              </div>
            </div>
            <div className='w-[100%] h-[50%] flex ' >
              <div className='w-[100%] h-[100%] flex items-center ml-[15%] ' >
                <ControlCameraIcon sx={{ padding: "0%", color: "white", width: "15%", height: "50%" }} />
                <p className='text-white text-2xl font-semibold mr-4' >Display Status</p>
                <button className=" toggle-switch2" onClick={handleDispStatus}>
                  <input type="checkbox" checked={dispStatus} onChange={() => { }} />
                  <span className="slider2 round2"></span>
                </button>

              </div>
            </div>
          </div>
          <div className='w-[100%] h-[20%] border-t flex flex-col  ' >
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
          <div className='w-[100%] h-[15%] flex  items-center cursor-pointer  border-t border-white signoutdiv ' onClick={handleSignOut} >
            <ExitToAppIcon style={{ color: "white", width: "15%", height: "40%", padding: "-10px", margin: "0" }} />
            <p className='text-white text-lg font-light ' >Sign-Out</p>
          </div>

        </div>
      </Drawer>
    </>
  )
}

export default NavBar;