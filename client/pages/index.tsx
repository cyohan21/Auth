import {useState, useEffect} from "react"
import api from "../lib/axios"

export default function Home() {
  const [message, setMessage] = useState('Loading..')

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    const refreshToken = localStorage.getItem("refreshToken")

    if (!token) {
    setMessage("❌ You are not currently logged in.")
    return
  }
    try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      if (!refreshToken) {
        setMessage("⚠️ Session has expired. Please log in again.")
      }

      api.get("/auth/refresh")
      .then(res => {
        const newAccessToken = res.data.accessToken;
          localStorage.setItem("accessToken", newAccessToken);
          const newRefreshToken = res.data.refreshToken;
          localStorage.setItem("refreshToken", newRefreshToken)
          setMessage("✅ You are logged in (refreshed).");
      })
      .catch(err => {
        console.error("Refresh failed:", err);
        setMessage("⚠️ Session has expired. Please log in again.")
      })
    }
    else {
      setMessage("✅ You are logged in.")
    }
    }
    catch (err: any) {
      console.error("Invalid token format", err);
      setMessage("❌ Invalid token.")
    }

  }, [])


  return (
    <div>
      {message}
    </div>
  )
}