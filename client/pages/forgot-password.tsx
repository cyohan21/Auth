import {useState} from "react"
import api from "../lib/axios"
import Link from "next/link"

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const res = await api.post('/auth/forgot-password', {email})
            setMessage('✅' + res.data.message)
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
            type="email"
            placeholder="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            />
            <button type="submit" disabled={loading}>{loading? 'Awaiting confirmation...': 'Reset'}</button>
            </form>
            <p>Remember your password? <Link href="/login" style={{color: 'blue'}}>Login.</Link></p>
            {message && <p style={{color: message.startsWith('✅')? 'green' : 'red'}}>{message}</p>}
        </div>
    )
}