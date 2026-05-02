import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'

export const useAuth = () => {
    const { setUser, setLoading } = useAuthStore()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user)
            setLoading(false)

            // если юзер залогинился — создаём/обновляем его на бэке
            if (user) {
                await api.post('/login')
            }
        })

        return () => unsubscribe()
    }, [])
}