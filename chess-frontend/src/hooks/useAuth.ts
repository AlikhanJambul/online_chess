import { useEffect } from 'react'
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'

export const useAuth = () => {
    const { setUser, setLoading } = useAuthStore()

    useEffect(() => {
        getRedirectResult(auth).then(async (result) => {
            if (result?.user) {
                setUser(result.user)
                await api.post('/login')
            }
        }).catch(() => {})

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user)
            setLoading(false)
            if (user) {
                await api.post('/login')
            }
        })

        return () => unsubscribe()
    }, [])
}