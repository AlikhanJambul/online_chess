import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { useThemeStore } from '../store/themeStore'

export default function Login() {
    const { isDark, toggle } = useThemeStore()

    const handleLogin = async () => {
        await signInWithPopup(auth, googleProvider)
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
            <button
                onClick={toggle}
                className="fixed top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-lg transition hover:opacity-70"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
                {isDark ? '☀️' : '🌙'}
            </button>

            <div className="w-full max-w-sm flex flex-col items-center gap-8">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl shadow-lg"
                        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                        ♟
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Chess</h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>Играй. Учись. Побеждай.</p>
                    </div>
                </div>

                <div className="grid grid-cols-8 gap-0 w-40 h-40 rounded-2xl overflow-hidden shadow-xl">
                    {Array.from({ length: 64 }).map((_, i) => {
                        const row = Math.floor(i / 8)
                        const col = i % 8
                        const isLight = (row + col) % 2 === 0
                        return (
                            <div key={i} style={{ background: isLight ? '#f0d9b5' : '#b58863' }} />
                        )
                    })}
                </div>

                <div className="w-full rounded-3xl p-6 flex flex-col gap-4 shadow-xl"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="text-center">
                        <h2 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>Добро пожаловать</h2>
                        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>Войди чтобы начать играть</p>
                    </div>

                    <button
                        onClick={handleLogin}
                        className="w-full py-3 px-4 rounded-2xl flex items-center justify-center gap-3 font-medium transition hover:opacity-90 active:scale-95 shadow-sm"
                        style={{ background: '#ffffff', color: '#1a1a1a', border: '1px solid #e0e0e0' }}
                    >
                        <img src="https://www.google.com/favicon.ico" className="w-5 h-5" />
                        Войти через Google
                    </button>
                </div>
            </div>
        </div>
    )
}