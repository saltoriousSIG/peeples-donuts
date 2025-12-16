"use client"

import { useEffect, useState } from "react"

interface CountdownProps {
    endTime: number // Unix timestamp in milliseconds
    className?: string
}

export function Countdown({ endTime, className = "" }: CountdownProps) {
    console.log(endTime);
    const [timeLeft, setTimeLeft] = useState("")

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = Date.now()
            const difference = endTime - now

            if (difference <= 0) {
                setTimeLeft("Ended")
                return
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24))
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((difference % (1000 * 60)) / 1000)

            // Format based on time remaining
            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h`)
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m`)
            } else if (minutes > 0) {
                setTimeLeft(`${minutes}m ${seconds}s`)
            } else {
                setTimeLeft(`${seconds}s`)
            }
        }

        // Calculate immediately
        calculateTimeLeft()

        // Update every second
        const interval = setInterval(calculateTimeLeft, 1000)

        return () => clearInterval(interval)
    }, [endTime])

    return <span className={className}>{timeLeft}</span>
}
