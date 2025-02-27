import Image from 'next/image'

export default function ComingSoonPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-4">
            <div className="max-w-4xl w-full text-center">
                <div className='relative w-[200px] h-[200px] mx-auto justify-center'>
                <Image
                    src="/deeptrack-transparent.png"
                    alt="Logo"
                    fill
                    className="object-contain"
                    priority
                />
                </div>
                <h1 className="text-5xl font-bold mb-4 text-purple-400">Coming Soon</h1>
                <p className="text-xl mb-8 text-gray-300">We&apos;re working hard to bring you something amazing. Stay tuned!</p>
            </div>
        </div>
    )
}