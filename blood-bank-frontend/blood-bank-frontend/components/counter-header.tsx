"use client"

interface CounterHeaderProps {
  userName: string
  counterId: string
  onLogout: () => void
}

export default function CounterHeader({ userName, counterId, onLogout }: CounterHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className=" rounded-full">
           <span className="text-white font-bold text-2xl">🩸</span>
          </div>
          <span className="text-gray-600 text-sm">
            <span className="text-gray-900 font-medium">Welcome back, {userName}</span>
            <br />
            <span>Counter : {counterId}</span>
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        {/* <button className="text-gray-600 hover:text-gray-900">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button> */}

        {/* <button className="relative">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            1
          </span>
        </button> */}

        <h1  className="text-lg">Orchid - Blood Center ( Managed by Shonit Foundation)</h1>

        {/* <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          </svg>
        </button> */}
      </div>
    </header>
  )
}
