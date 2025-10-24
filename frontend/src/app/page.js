"use client"
import React from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
    const router = useRouter()

    return (
        <div className="initialView w-[100dvw] h-[100dvh] flex items-center justify-center
        bg-[white] text-white text-poppins">
            <button className='bg-green-700 text-white  text-[20px] text-poppins
            rounded-[10px] px-[20px] py-[10px] hover:bg-green-800 hover:cursor-pointer'
            onClick={() => {
                router.push('/civilian');
            }}>
                Go to Civilian Page
            </button>
        </div>
    )
}
