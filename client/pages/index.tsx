import {useState, useEffect} from "react"
import api from "../lib/axios"
import Link from "next/link"

export default function Home() {
  const [message, setMessage] = useState('Loading..')
  const [loginStatus, setLoginStatus] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
    const res = await api.get('/auth/me')
    setMessage(`✅ Logged in as ${res.data.email}`)
    setLoginStatus(true)

    }
    catch (err: any) {
      console.error("Not currently logged in or session expired:", err);
      setMessage("❌ You are not currently logged in.")
    }
    }
    checkAuth()
  }, [])


  return (
    <div>
      {message}
      {loginStatus && <p>Click <Link href="/logout" style={{color: 'blue'}}>here</Link> to logout.</p>}
    </div>
  )
}