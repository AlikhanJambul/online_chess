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
    const { isDark } = useThemeStore()
    const [games, setGames] = useState<Game[]>([])
    const [loading, setLoading] = useState(true)

    const bg = isDark ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-900'
    const card = isDark ? 'bg-zinc-800' : 'bg-white'
    const row = isDark ? 'border-zinc-700' : 'border-zinc-200'

    useEffect(() => {
        if (!user) return
        api.get(`/users/${user.uid}/games`)
            .then(res => setGames(res.data || []))
            .finally(() => setLoading(false))
    }, [user])

    const getResult = (game: Game) => {
        if (game.status !== 'finished') return { label: 'В процессе', color: 'text-zinc-500' }
        if (!game.winner_id) return { label: 'Ничья 🤝', color: 'text-zinc-400' }
        return game.winner_id === user?.uid
            ? { label: 'Победа 🎉', color: 'text-green-500' }
            : { label: 'Поражение 😔', color: 'text-red-500' }
    }

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bg}`}>
            <div className={`w-full max-w-lg rounded-2xl shadow-xl p-6 flex flex-col gap-6 ${card}`}>
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-zinc-500 hover:text-zinc-300 transition"
                    >
                        ← Назад
                    </button>
                    <h1 className="text-xl font-bold">👤 Профиль</h1>
                    <div className="w-12" />
                </div>

                <div className="flex items-center gap-4">
                    {user?.photoURL && (
                        <img
                            src={user.photoURL}
                            className="w-14 h-14 rounded-full"
                        />
                    )}
                    <div>
                        <p className="font-semibold text-lg">{user?.displayName}</p>
                        <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{user?.email}</p>
                    </div>
                </div>

                <div>
                    <h2 className="font-semibold mb-3">История игр</h2>
                    {loading ? (
                        <p className="text-zinc-500 text-sm">Загрузка...</p>
                    ) : games.length === 0 ? (
                        <p className="text-zinc-500 text-sm">Игр пока нет</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={`border-b ${row} text-zinc-500`}>
                                    <th className="py-2 text-left">Дата</th>
                                    <th className="py-2 text-right">Результат</th>
                                </tr>
                            </thead>
                            <tbody>
                                {games.map(game => {
                                    const result = getResult(game)
                                    return (
                                        <tr key={game.id} className={`border-b ${row}`}>
                                            <td className="py-3 text-zinc-500">
                                                {new Date(game.created_at).toLocaleDateString()}
                                            </td>
                                            <td className={`py-3 text-right font-medium ${result.color}`}>
                                                {result.label}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}