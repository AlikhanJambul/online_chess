import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../store/themeStore'
import api from '../api/axios'

interface LeaderboardEntry {
    id: string
    name: string
    avatar_url: string
    wins: number
    losses: number
    rank: number
}

export default function Leaderboard() {
    const navigate = useNavigate()
    const { isDark } = useThemeStore()
    const [entries, setEntries] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)

    const bg = isDark ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-900'
    const card = isDark ? 'bg-zinc-800' : 'bg-white'
    const row = isDark ? 'border-zinc-700' : 'border-zinc-200'

    useEffect(() => {
        api.get('/leaderboard')
            .then(res => setEntries(res.data || []))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${bg}`}>
            <div className={`w-full max-w-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4 ${card}`}>
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-zinc-500 hover:text-zinc-300 transition"
                    >
                        ← Назад
                    </button>
                    <h1 className="text-xl font-bold">🏆 Лидерборд</h1>
                    <div className="w-12" />
                </div>

                {loading ? (
                    <p className="text-center text-zinc-500">Загрузка...</p>
                ) : entries.length === 0 ? (
                    <p className="text-center text-zinc-500">Пока никого нет</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={`border-b ${row} text-zinc-500`}>
                                <th className="py-2 text-left">#</th>
                                <th className="py-2 text-left">Игрок</th>
                                <th className="py-2 text-center">Победы</th>
                                <th className="py-2 text-center">Поражения</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry, i) => (
                                <tr key={entry.id} className={`border-b ${row}`}>
                                    <td className="py-3 text-zinc-500">
                                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : entry.rank}
                                    </td>
                                    <td className="py-3 font-medium">{entry.name}</td>
                                    <td className="py-3 text-center text-green-500 font-medium">{entry.wins}</td>
                                    <td className="py-3 text-center text-red-500 font-medium">{entry.losses}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}