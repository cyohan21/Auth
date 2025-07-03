import {useState, useEffect} from "react"
import { useRouter } from 'next/router'
import api from "../lib/axios"
import Link from "next/link"

export default function Login() {
    const router = useRouter()
    const [token, setToken] = useState<string | null>(null)

    const [newPassword, setNewPassword] = useState('')
    const [verifyNewPassword, setVerifyNewPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (router.isReady) { // only when router is ready!
      const t = typeof router.query.token === 'string' ? router.query.token : null
      setToken(t)
        if (!t) setMessage("❌ Reset token not found in the URL.")
        }
    }, [router.isReady, router.query.token])


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const res = await api.post('/auth/reset-password', {newPassword, verifyNewPassword})
            setMessage(res.data.message)
        }
        catch (err: any) {
        const data = err.response?.data
        let message = err.message

        if (data?.details) {
            const allMessages = Object.values(data.details).flat()
            message = allMessages[0]
        } else if (data?.error) {
            message = data.error
        }

        setMessage('❌ ' + message)
    } 
        finally {
            setLoading(false)
        }
    }
    return (
        
        <div style={{
            maxWidth: '400px',
            margin: '50px auto',
            padding: '2rem',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            fontFamily: 'sans-serif'
        }}> 
            <h1>Reset Password</h1>
            <form onSubmit={handleSubmit} noValidate>
            <input 
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            />
            <input 
            type="password"
            placeholder="Verify new password"
            value={verifyNewPassword}
            onChange={e => setVerifyNewPassword(e.target.value)}
            required
            />
            <button type="submit" disabled={loading}>{loading? 'Resetting Password...': 'Login'}</button>
            </form>
            <p>Ready to login? <Link href="/login" style={{color: 'blue'}}>Do it here.</Link></p>
            {message && <p style={{color: message.startsWith('✅')? 'green' : 'red'}}>{message}</p>}
            
        </div>
    )
}