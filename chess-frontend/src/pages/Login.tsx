import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

export default function Login() {
    const handleLogin = async () => {
        await signInWithPopup(auth, googleProvider)
    }

    return (
        <div>
            <h1>Chess App</h1>
            <button onClick={handleLogin}>Sign in with Google</button>
        </div>
    )
}