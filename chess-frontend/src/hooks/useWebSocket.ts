import { useEffect, useRef, useCallback } from 'react'
import { auth } from '../firebase'

export const useWebSocket = (
    gameId: string,
    onMessage: (msg: any) => void,
    onOpen?: () => void
) => {
    const wsRef = useRef<WebSocket | null>(null)

    useEffect(() => {
        if (!gameId) return
        let ws: WebSocket

        const connect = async () => {
            const user = auth.currentUser
            if (!user) return

            const token = await user.getIdToken()
            const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080'
            ws = new WebSocket(`${wsUrl}/ws/games/${gameId}?token=${token}`)

            ws.onopen = () => {
                console.log('ws connected')
                setTimeout(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        onOpen?.()
                    }
                }, 100)
                onOpen?.()
            }

            ws.onmessage = (e) => {
                const msg = JSON.parse(e.data)
                onMessage(msg)
            }

            ws.onclose = () => console.log('ws disconnected')
            wsRef.current = ws
        }

        connect()
        return () => ws?.close()
    }, [gameId])

    const sendMessage = useCallback((msg: any) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(msg))
        }
    }, [])

    return { sendMessage, wsRef }
}