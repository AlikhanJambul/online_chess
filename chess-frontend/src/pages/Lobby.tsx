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

    const bg = isDark ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-900'
    const card = isDark ? 'bg-zinc-800' : 'bg-white'
    const btn = isDark ? 'bg-zinc-700 hover:bg-zinc-600 text-white' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-900'

    const handlePlayBot = async () => {
        const res = await api.post('/games')
        navigate(`/game/${res.data.id}?mode=bot`)
    }

    const handleCreateOnline = async () => {
        const res = await api.post('/games')
        navigate(`/game/${res.data.id}?mode=online`)
    }

    const handleLogout = async () => {
        await signOut(auth)
        navigate('/login')
    }

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center ${bg}`}>
            <button
                onClick={toggle}
                className="absolute top-4 right-4 p-2 rounded-full border border-zinc-600 text-sm"
            >
                {isDark ? '☀️' : '🌙'}
            </button>

            <div className={`p-10 rounded-2xl shadow-xl flex flex-col items-center gap-6 w-full max-w-sm ${card}`}>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-5xl">♟</span>
                    <h1 className="text-2xl font-bold">Chess App</h1>
                    <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {user?.displayName}
                    </p>
                </div>

                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={handlePlayBot}
                        className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium transition"
                    >
                        🤖 Играть с ботом
                    </button>
                    <button
                        onClick={handleCreateOnline}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
                    >
                        🔗 Создать игру онлайн
                    </button>
                    <button
                        onClick={() => navigate('/leaderboard')}
                        className={`w-full py-3 rounded-xl font-medium transition ${btn}`}
                    >
                        🏆 Лидерборд
                    </button>
                    <button
                        onClick={() => navigate('/profile')}
                        className={`w-full py-3 rounded-xl font-medium transition ${btn}`}
                    >
                        👤 Профиль
                    </button>
                </div>

                <button
                    onClick={handleLogout}
                    className="text-sm text-zinc-500 hover:text-red-400 transition"
                >
                    Выйти
                </button>
            </div>
        </div>
    )
}