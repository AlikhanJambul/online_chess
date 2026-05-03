import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import api from '../api/axios'

interface Game {
    id: string
    white_id: string
    black_id: string | null
    winner_id: string | null
    status: string
    created_at: string
}

export default function Profile() {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { isDark, toggle } = useThemeStore()
    const [games, setGames] = useState<Game[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return
        api.get(`/users/${user.uid}/games`)
            .then(res => setGames(res.data || []))
            .finally(() => setLoading(false))
    }, [user])

    const wins = games.filter(g => g.winner_id === user?.uid).length
    const losses = games.filter(g => g.status === 'finished' && g.winner_id && g.winner_id !== user?.uid).length

    const getResult = (game: Game) => {
        if (game.status !== 'finished') return { label: 'В процессе', color: 'var(--text2)', bg: 'var(--bg2)' }
        if (!game.winner_id) return { label: 'Ничья', color: '#8a8070', bg: 'var(--bg2)' }
        return game.winner_id === user?.uid
            ? { label: 'Победа', color: '#2d7a2d', bg: '#e8f5e8' }
            : { label: 'Поражение', color: '#a33', bg: '#fde8e8' }
    }

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
            <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition hover:opacity-70"
                        style={{ background: 'var(--bg2)' }}
                    >
                        ←
                    </button>
                    <h1 className="font-bold text-lg" style={{ color: 'var(--text)' }}>👤 Профиль</h1>
                </div>
                <button
                    onClick={toggle}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg transition hover:opacity-70"
                    style={{ background: 'var(--bg2)' }}
                >
                    {isDark ? '☀️' : '🌙'}
                </button>
            </header>

            <main className="flex-1 p-4 sm:p-8 max-w-2xl mx-auto w-full flex flex-col gap-4">
                {/* User card */}
                <div className="rounded-3xl p-6 flex items-center gap-4 shadow-sm"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    {user?.photoURL
                        ? <img src={user.photoURL} className="w-16 h-16 rounded-2xl flex-shrink-0" />
                        : <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: 'var(--bg2)' }}>👤</div>
                    }
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-xl truncate" style={{ color: 'var(--text)' }}>{user?.displayName}</p>
                        <p className="text-sm truncate" style={{ color: 'var(--text2)' }}>{user?.email}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl p-4 text-center shadow-sm"
                        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                        <p className="text-3xl font-bold" style={{ color: '#4d9e4d' }}>{wins}</p>
                        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>Победы</p>
                    </div>
                    <div className="rounded-2xl p-4 text-center shadow-sm"
                        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                        <p className="text-3xl font-bold" style={{ color: '#c44' }}>{losses}</p>
                        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>Поражения</p>
                    </div>
                </div>

                {/* History */}
                <div className="rounded-3xl overflow-hidden shadow-sm"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                        <h2 className="font-semibold" style={{ color: 'var(--text)' }}>История игр</h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center" style={{ color: 'var(--text2)' }}>Загрузка...</div>
                    ) : games.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center gap-2">
                            <span className="text-3xl">♟</span>
                            <p style={{ color: 'var(--text2)' }}>Игр пока нет</p>
                        </div>
                    ) : (
                        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                            {games.map(game => {
                                const result = getResult(game)
                                return (
                                    <div key={game.id} className="flex items-center justify-between px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">♟</span>
                                            <div>
                                                <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                                                    Онлайн партия
                                                </p>
                                                <p className="text-xs" style={{ color: 'var(--text2)' }}>
                                                    {new Date(game.created_at).toLocaleDateString('ru-RU')}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className="text-xs font-semibold px-3 py-1 rounded-full"
                                            style={{ color: result.color, background: result.bg }}
                                        >
                                            {result.label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}