import {useState} from "react"
import api from "../lib/axios"

export default function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault() // prevent page reloads on submit
        setLoading(true) // turn on the loading button
        setMessage("") // Reset message response to blank on submit (waiting for response)

    try {
        const res = await api.post('/auth/register', {email, password})
        setMessage('✅ ' + res.data.message)
    }
    catch (err: any) {
        setMessage('❌ ' + (err.response?.data?.message || err.message))
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
            <h1>Register</h1>
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
                />
                <button type="submit" disabled={loading}> {/*button is disabled if loading is true.*/}
                    {loading? 'Registering...': 'Register'}
                </button>
            </form>
            {message && <p>{message}</p>} {/*If message exists, render it, else, don't.*/}
        </div>
    )
}