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
    const { isDark, toggle } = useThemeStore()
    const [entries, setEntries] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/leaderboard')
            .then(res => setEntries(res.data || []))
            .finally(() => setLoading(false))
    }, [])

    const medals = ['🥇', '🥈', '🥉']

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
                    <h1 className="font-bold text-lg" style={{ color: 'var(--text)' }}>🏆 Лидерборд</h1>
                </div>
                <button
                    onClick={toggle}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg transition hover:opacity-70"
                    style={{ background: 'var(--bg2)' }}
                >
                    {isDark ? '☀️' : '🌙'}
                </button>
            </header>

            <main className="flex-1 p-4 sm:p-8 max-w-2xl mx-auto w-full">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <p style={{ color: 'var(--text2)' }}>Загрузка...</p>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-2">
                        <span className="text-4xl">🏆</span>
                        <p style={{ color: 'var(--text2)' }}>Пока никого нет</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {entries.map((entry, i) => (
                            <div
                                key={entry.id}
                                className="flex items-center gap-4 p-4 rounded-2xl transition"
                                style={{
                                    background: i === 0 ? 'linear-gradient(135deg, #ffd700 0%, #ffb800 100%)' :
                                               i === 1 ? 'linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%)' :
                                               i === 2 ? 'linear-gradient(135deg, #cd7f32 0%, #b06020 100%)' :
                                               'var(--card)',
                                    border: '1px solid var(--border)',
                                    color: i < 3 ? '#1a1a1a' : 'var(--text)'
                                }}
                            >
                                <div className="w-10 text-center text-xl font-bold flex-shrink-0">
                                    {i < 3 ? medals[i] : <span style={{ color: 'var(--text2)' }}>{i + 1}</span>}
                                </div>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                                    style={{ background: i < 3 ? 'rgba(0,0,0,0.15)' : 'var(--bg2)' }}>
                                    {entry.avatar_url
                                        ? <img src={entry.avatar_url} className="w-10 h-10 rounded-full" />
                                        : '👤'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate">{entry.name}</p>
                                    <p className="text-sm opacity-70">{entry.wins}П / {entry.losses}П</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="font-bold text-lg">{entry.wins}</p>
                                    <p className="text-xs opacity-70">побед</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}