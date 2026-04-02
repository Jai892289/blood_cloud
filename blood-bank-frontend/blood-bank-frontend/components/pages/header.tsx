"use client"

import Image from "next/image"
import { ArrowLeft } from "lucide-react"

export function Header() {
    return (
        <section className="relative w-full h-[300px] md:h-[350px] rounded-xl overflow-hidden flex items-center">

            {/* ===== Background Image ===== */}
            <Image
                src="/headerImage.png"
                alt="Header Background"
                fill
                priority
                className="object-cover object-center p-2"
            />

            {/* ===== Complete Back Button ===== */}
            {/* <button
                onClick={() => history.back()}
                className="
                    absolute top-12 left-5 z-20 
                    flex items-center gap-2
                    px-4 py-2 
                    bg-white/90 text-gray-900 
                    font-medium rounded-full 
                    shadow-lg backdrop-blur-sm
                    hover:bg-white transition
                "
            >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
            </button> */}

        </section>
    )
}
