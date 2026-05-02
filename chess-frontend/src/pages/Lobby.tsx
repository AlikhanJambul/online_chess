import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'
import api from '../api/axios'

export default function Lobby() {
    const navigate = useNavigate()
    const { user } = useAuthStore()

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
        <div>
            <h1>Chess App</h1>
            <p>Привет, {user?.displayName}</p>

            <button onClick={handlePlayBot}>Играть с ботом</button>
            <button onClick={handleCreateOnline}>Создать игру онлайн</button>
            <button onClick={() => navigate('/leaderboard')}>Лидерборд</button>
            <button onClick={() => navigate('/profile')}>Профиль</button>
            <button onClick={handleLogout}>Выйти</button>
        </div>
    )
}