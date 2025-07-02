import {useState} from "react"
import api from "../lib/axios"
import Link from "next/link"

export default function ResendEmailConfirmation() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')

    try {
        const res = await api.post('/auth/resend-email-confirmation', {email})
        setMessage('✅ ' + res.data.message)
    }
    catch (err: any) {
        const data = err.response.data
        let message = err.message

        if (data.details) {
            const allMessages = Object.values(data.details).flat()
            message = allMessages[0]
        }
        else if (data.error) {
            message = data.error
        }
        setMessage('❌ ' + message)
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
            <h1>Resend Email Link</h1>
            <form onSubmit={handleSubmit} noValidate>
                <input
                type="email"
                placeholder="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                />
                <button type="submit">Resend Email</button>
            </form>
            <p>Already verified? <Link href="/login" style={{color: 'blue'}}>Login here.</Link></p>
            {message && <p style={{color: message.startsWith('✅')? 'green' : 'red'}}>{message}</p>}
        </div>
    )
}