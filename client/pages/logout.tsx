import {useState, useEffect} from "react"
import api from "../lib/axios"


export default function Logout() {
    const [message, setMessage] = useState('Loading...')

    useEffect(() => {
        const loggingOut = async () => {
            try {
            api.get("/auth/logout")
            setMessage("✅ Successfully logged out.")
            setTimeout(() => {window.location.href = "/login"}, 1000)
        }
        catch (err: any) {
            console.error("Failed to logout", err)
            setMessage("❌ Failed to logout.")
        }
        }
        loggingOut()
    }, [])

    return (
        <div>
            {message}
        </div>
    )
}