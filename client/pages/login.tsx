import {useState} from "react"
import api from "../lib/axios"

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const res = await api.post('/auth/login', {email, password})
            setMessage(res.data.message)
        }
        catch (err: any) {
            setMessage(err.response?.data?.message || err.message)
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
            <form onSubmit={handleSubmit} noValidate>
            <input 
            type="email"
            placeholder="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            />
            <input 
            type="password"
            placeholder="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            />
            <button type="submit" disabled={loading}>{loading? 'Logging in...': 'Login'}</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    )
}