import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../store/themeStore'
import LeagueIcon from '../components/LeagueIcon'
import api from '../api/axios'

interface LeaderboardEntry {
    id: string
    name: string
    avatar_url: string
    wins: number
    losses: number
    rank: number
}

type League = 'bronze' | 'silver' | 'gold' | 'diamond'

const leagues = [
    { id: 'bronze' as League, label: 'Бронза', color: '#cd7f32', min: 0, max: 99 },
    { id: 'silver' as League, label: 'Серебро', color: '#a8a8a8', min: 100, max: 499 },
    { id: 'gold' as League, label: 'Золото', color: '#ffd700', min: 500, max: 999 },
    { id: 'diamond' as League, label: 'Алмаз', color: '#4fc3f7', min: 1000, max: null },
]

export default function Leaderboard() {
    const navigate = useNavigate()
    const { isDark, toggle } = useThemeStore()
    const [entries, setEntries] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [activeLeague, setActiveLeague] = useState<League>('bronze')

    useEffect(() => {
        setLoading(true)
        api.get(`/leaderboard?league=${activeLeague}`)
            .then(res => setEntries(res.data || []))
            .finally(() => setLoading(false))
    }, [activeLeague])

    const currentLeague = leagues.find(l => l.id === activeLeague)!
    const medals = ['🥇', '🥈', '🥉']

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
            <header className="flex items-center justify-between px-6 py-4 border-b"
                style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition hover:opacity-70"
                        style={{ background: 'var(--bg2)' }}
                    >
                        ←
                    </button>
                    <div className="flex items-center gap-2">
                        <LeagueIcon league={activeLeague} size={28} />
                        <h1 className="font-bold text-lg" style={{ color: 'var(--text)' }}>
                            {currentLeague.label} лига
                        </h1>
                    </div>
                </div>
                <button
                    onClick={toggle}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg transition hover:opacity-70"
                    style={{ background: 'var(--bg2)' }}
                >
                    {isDark ? '☀️' : '🌙'}
                </button>
            </header>

            {/* League tabs */}
            <div className="flex gap-2 p-4 overflow-x-auto"
                style={{ background: 'var(--card)', borderBottom: `1px solid var(--border)` }}>
                {leagues.map(league => (
                    <button
                        key={league.id}
                        onClick={() => setActiveLeague(league.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition flex-shrink-0"
                        style={{
                            background: activeLeague === league.id ? league.color : 'var(--bg2)',
                            color: activeLeague === league.id ? '#1a1a1a' : 'var(--text2)',
                            fontWeight: activeLeague === league.id ? 600 : 400,
                        }}
                    >
                        <LeagueIcon league={league.id} size={20} />
                        <span>{league.label}</span>
                        <span className="text-xs opacity-70">
                            {league.max ? `${league.min}-${league.max}` : `${league.min}+`}
                        </span>
                    </button>
                ))}
            </div>

            <main className="flex-1 p-4 sm:p-8 max-w-2xl mx-auto w-full">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <p style={{ color: 'var(--text2)' }}>Загрузка...</p>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-3">
                        <LeagueIcon league={activeLeague} size={64} />
                        <p style={{ color: 'var(--text2)' }}>В этой лиге пока никого нет</p>
                        <p className="text-sm" style={{ color: 'var(--text2)' }}>
                            Нужно {currentLeague.min}+ побед
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {entries.map((entry, i) => (
                            <div
                                key={entry.id}
                                className="flex items-center gap-4 p-4 rounded-2xl"
                                style={{
                                    background: i === 0 ? `${currentLeague.color}22` : 'var(--card)',
                                    border: i === 0 ? `1px solid ${currentLeague.color}` : '1px solid var(--border)',
                                }}
                            >
                                <div className="w-10 text-center text-xl font-bold flex-shrink-0">
                                    {i < 3
                                        ? medals[i]
                                        : <span style={{ color: 'var(--text2)' }}>{i + 1}</span>
                                    }
                                </div>
                                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
                                    style={{ background: 'var(--bg2)' }}>
                                    {entry.avatar_url
                                        ? <img src={entry.avatar_url} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center text-lg">👤</div>
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate" style={{ color: 'var(--text)' }}>{entry.name}</p>
                                    <p className="text-xs" style={{ color: 'var(--text2)' }}>
                                        {entry.wins} побед / {entry.losses} поражений
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="font-bold text-lg" style={{ color: currentLeague.color }}>{entry.wins}</p>
                                    <p className="text-xs" style={{ color: 'var(--text2)' }}>побед</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}