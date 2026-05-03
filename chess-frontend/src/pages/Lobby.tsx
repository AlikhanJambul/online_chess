import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'
import api from '../api/axios'

export default function Lobby() {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { isDark, toggle } = useThemeStore()

    const handlePlayBot = () => navigate('/game/bot?mode=bot')

    const handleCreateOnline = async () => {
        const res = await api.post('/games')
        navigate(`/game/${res.data.id}?mode=online`)
    }

    const handleLogout = async () => {
        await signOut(auth)
        navigate('/login')
    }

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
                <div className="flex items-center gap-2">
                    <span className="text-2xl">♟</span>
                    <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--text)' }}>Chess</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggle}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-lg transition hover:opacity-70"
                        style={{ background: 'var(--bg2)' }}
                    >
                        {isDark ? '☀️' : '🌙'}
                    </button>
                    {user?.photoURL && (
                        <img src={user.photoURL} className="w-9 h-9 rounded-full" />
                    )}
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 flex flex-col lg:flex-row gap-6 p-4 sm:p-8 max-w-5xl mx-auto w-full">
                {/* Left - Welcome */}
                <div className="flex-1 flex flex-col justify-center gap-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                            Привет, {user?.displayName?.split(' ')[0]} 👋
                        </h1>
                        <p className="text-base" style={{ color: 'var(--text2)' }}>
                            Готов к игре? Выбери режим и начинай.
                        </p>
                    </div>

                    {/* Chess pattern decoration */}
                    <div className="hidden lg:grid grid-cols-8 gap-0 w-48 h-48 rounded-xl overflow-hidden shadow-lg">
                        {Array.from({ length: 64 }).map((_, i) => {
                            const row = Math.floor(i / 8)
                            const col = i % 8
                            const isLight = (row + col) % 2 === 0
                            return (
                                <div
                                    key={i}
                                    style={{ background: isLight ? '#f0d9b5' : '#b58863' }}
                                />
                            )
                        })}
                    </div>
                </div>

                {/* Right - Menu */}
                <div className="flex flex-col gap-3 w-full lg:w-80">
                    <button
                        onClick={handlePlayBot}
                        className="w-full p-4 rounded-2xl flex items-center gap-4 transition hover:opacity-90 active:scale-95"
                        style={{ background: '#4d9e4d' }}
                    >
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">🤖</div>
                        <div className="text-left">
                            <div className="font-semibold text-white text-base">Играть с ботом</div>
                            <div className="text-white/70 text-sm">Тренировка офлайн</div>
                        </div>
                    </button>

                    <button
                        onClick={handleCreateOnline}
                        className="w-full p-4 rounded-2xl flex items-center gap-4 transition hover:opacity-90 active:scale-95"
                        style={{ background: '#4a7cc7' }}
                    >
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">🌐</div>
                        <div className="text-left">
                            <div className="font-semibold text-white text-base">Создать игру</div>
                            <div className="text-white/70 text-sm">Пригласи друга по ссылке</div>
                        </div>
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => navigate('/leaderboard')}
                            className="p-4 rounded-2xl flex flex-col items-center gap-2 transition hover:opacity-90 active:scale-95"
                            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                        >
                            <span className="text-2xl">🏆</span>
                            <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Лидерборд</span>
                        </button>
                        <button
                            onClick={() => navigate('/profile')}
                            className="p-4 rounded-2xl flex flex-col items-center gap-2 transition hover:opacity-90 active:scale-95"
                            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                        >
                            <span className="text-2xl">👤</span>
                            <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Профиль</span>
                        </button>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="text-sm py-2 transition hover:opacity-70"
                        style={{ color: 'var(--text2)' }}
                    >
                        Выйти из аккаунта
                    </button>
                </div>
            </main>
        </div>
    )
}