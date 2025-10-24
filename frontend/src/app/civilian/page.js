import React from 'react'
import Image from 'next/image'
import Logo from '../Logo.svg'
import Nav from '../../components/CivilianNavBar.jsx'

export default function page() {
    return (
        <div className='w-[100dvw] h-[100dvh] flex items-center justify-start flex-col
        text-white text-poppins'>

            <div className='titleElement flex flex-row align-center justify-center
            mb-[20px] w-full h-[90px] bg-[#ECF1E6] px-2 py-4'>

                <div className='orgLogo flex items-center justify-center ml-4'>
                    <Image src={Logo} alt='EcoCollect Logo' width={180} height={60} className='object-contain'/>
                </div>

                <div className='pointCard bg-[#FCFEF7] text-black flex flex-col
                w-40 h-16 border-[1px] border-gray-300 px-2 py-2 ml-auto mr-2
                shadow-[rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px]'>
                    <h4 className='text-[14px] font-light'>Points Balance</h4>
                    <h2 className='text-[18px] font-semibold'>250</h2>
                </div>

                <button className='logoutButton  bg-[#FCFEF7] rounded-[64px] mt-[10px]
                w-[102px] h-[36px] text-black text-[16px] font-medium align-center mr-4
                justify-center shadow-[rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px]'>
                    Logout
                </button>
            </div>

            <div className='mainContentArea flex flex-col items-center justify-start
            w-full h-[calc(676px)] bg-[#FFFFFF]'>

                <Nav />

            </div>
        </div>
    )
}
