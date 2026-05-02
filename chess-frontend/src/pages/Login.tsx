import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { useThemeStore } from '../store/themeStore'

export default function Login() {
    const { isDark, toggle } = useThemeStore()

    const handleLogin = async () => {
        await signInWithPopup(auth, googleProvider)
    }

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-900'}`}>
            <button
                onClick={toggle}
                className="absolute top-4 right-4 p-2 rounded-full border border-zinc-600 text-sm"
            >
                {isDark ? '☀️' : '🌙'}
            </button>

            <div className={`p-10 rounded-2xl shadow-xl flex flex-col items-center gap-6 ${isDark ? 'bg-zinc-800' : 'bg-white'}`}>
                <div className="flex flex-col items-center gap-2">
                    <span className="text-5xl">♟</span>
                    <h1 className="text-3xl font-bold tracking-tight">Chess App</h1>
                    <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Играй. Побеждай. Расти.</p>
                </div>

                <button
                    onClick={handleLogin}
                    className="flex items-center gap-3 bg-white text-zinc-900 px-6 py-3 rounded-xl font-medium shadow hover:shadow-md transition"
                >
                    <img src="https://www.google.com/favicon.ico" className="w-5 h-5" />
                    Войти через Google
                </button>
            </div>
        </div>
    )
}