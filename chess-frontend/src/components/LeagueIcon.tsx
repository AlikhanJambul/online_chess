type LeagueIconProps = {
    league: 'bronze' | 'silver' | 'gold' | 'diamond'
    size?: number
}

export default function LeagueIcon({ league, size = 40 }: LeagueIconProps) {
    if (league === 'bronze') return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
            <path d="M20 3L6 9V20C6 28 13 35 20 37C27 35 34 28 34 20V9L20 3Z" fill="#cd7f32" opacity="0.2" stroke="#cd7f32" strokeWidth="1.5"/>
            <path d="M20 8L10 13V20C10 26 15 31 20 33C25 31 30 26 30 20V13L20 8Z" fill="#cd7f32" opacity="0.4"/>
            <text x="20" y="24" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#cd7f32">B</text>
        </svg>
    )

    if (league === 'silver') return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
            <path d="M20 3L6 9V20C6 28 13 35 20 37C27 35 34 28 34 20V9L20 3Z" fill="#a8a8a8" opacity="0.2" stroke="#a8a8a8" strokeWidth="1.5"/>
            <path d="M20 8L10 13V20C10 26 15 31 20 33C25 31 30 26 30 20V13L20 8Z" fill="#a8a8a8" opacity="0.4"/>
            <path d="M16 18L19 21L24 15" stroke="#a8a8a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )

    if (league === 'gold') return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
            <path d="M20 3L6 9V20C6 28 13 35 20 37C27 35 34 28 34 20V9L20 3Z" fill="#ffd700" opacity="0.2" stroke="#ffd700" strokeWidth="1.5"/>
            <path d="M20 8L10 13V20C10 26 15 31 20 33C25 31 30 26 30 20V13L20 8Z" fill="#ffd700" opacity="0.4"/>
            <path d="M20 12L21.8 17.5H27.5L23 21L24.8 26.5L20 23L15.2 26.5L17 21L12.5 17.5H18.2L20 12Z" fill="#ffd700"/>
        </svg>
    )

    return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
            <path d="M20 3L6 9V20C6 28 13 35 20 37C27 35 34 28 34 20V9L20 3Z" fill="#4fc3f7" opacity="0.2" stroke="#4fc3f7" strokeWidth="1.5"/>
            <path d="M20 8L10 13V20C10 26 15 31 20 33C25 31 30 26 30 20V13L20 8Z" fill="#4fc3f7" opacity="0.4"/>
            <path d="M20 13L22 18H27L23 21.5L24.5 27L20 23.5L15.5 27L17 21.5L13 18H18L20 13Z" fill="none" stroke="#4fc3f7" strokeWidth="1.5"/>
            <circle cx="20" cy="20" r="3" fill="#4fc3f7"/>
        </svg>
    )
}