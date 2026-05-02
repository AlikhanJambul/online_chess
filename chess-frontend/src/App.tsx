import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useAuthStore } from './store/authStore'
import Lobby from './pages/Lobby'
import Game from './pages/Game'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Login from './pages/Login'


function App() {
    useAuth()

    const { user, loading } = useAuthStore()

    if (loading) return <div>Loading...</div>

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={user ? <Lobby /> : <Navigate to="/login" />} />
                <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
                <Route path="/game/:id" element={user ? <Game /> : <Navigate to="/login" />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App