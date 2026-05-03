import { useState, useEffect, useCallback, useRef } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { useStockfish } from '../hooks/useStockfish'
import { useWebSocket } from '../hooks/useWebSocket'
import api from '../api/axios'
import type { PieceDropHandlerArgs } from 'react-chessboard'

export default function Game() {
    const { id } = useParams<{ id: string }>()
    const [searchParams] = useSearchParams()
    const mode = searchParams.get('mode')
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { isDark } = useThemeStore()

    const [game, setGame] = useState(new Chess())
    const [fen, setFen] = useState(new Chess().fen())
    const [status, setStatus] = useState<string>(
        mode === 'online' ? 'Ожидание соперника...' :
        mode === 'join' ? 'Подключение...' : 'Ваш ход'
    )
    const [playerColor, setPlayerColor] = useState<'white' | 'black'>(
        mode === 'join' ? 'black' : 'white'
    )
    const [gameOver, setGameOver] = useState(false)
    const [gameStarted, setGameStarted] = useState(mode === 'bot')
    const [inviteLink, setInviteLink] = useState<string>('')
    const [copied, setCopied] = useState(false)

    const playerColorRef = useRef(playerColor)
    useEffect(() => { playerColorRef.current = playerColor }, [playerColor])

    const joinedRef = useRef(false)

    const bg = isDark ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-900'
    const card = isDark ? 'bg-zinc-800' : 'bg-white'

    const gameOverRef = useRef(false)

    const handleGameOver = useCallback(async (chess: Chess, color: 'white' | 'black') => {
        if (!chess.isGameOver()) return
        if (gameOverRef.current) return
        setGameOver(true)

        if (chess.isCheckmate()) {
            const loserColor = chess.turn()
            const iUserLost = (loserColor === 'w' && color === 'white') ||
                              (loserColor === 'b' && color === 'black')
            if (iUserLost) {
                setStatus('Вы проиграли! 😔')
            } else {
                setStatus('Вы выиграли! 🎉')
                await api.post(`/games/${id}/finish`, { winner_id: user?.uid })
            }
        } else {
            setStatus('Ничья! 🤝')
        }
    }, [id, user])

    const handleBestMove = useCallback((moveStr: string) => {
        const from = moveStr.slice(0, 2)
        const to = moveStr.slice(2, 4)
        const promotion = moveStr.length > 4 ? moveStr[4] : undefined

        setGame(prev => {
            const newGame = new Chess(prev.fen())
            try {
                newGame.move({ from, to, promotion })
            } catch {
                return prev
            }
            setFen(newGame.fen())
            setStatus('Ваш ход')
            handleGameOver(newGame, playerColorRef.current)
            return newGame
        })
    }, [handleGameOver])

    const { getBestMove } = useStockfish(handleBestMove)

    const handleWSMessage = useCallback((msg: any) => {
        if (msg.type === 'move') {
            setGame(prev => {
                const newGame = new Chess(prev.fen())
                try {
                    newGame.move({ from: msg.from, to: msg.to })
                } catch {
                    return prev
                }
                setFen(newGame.fen())
                setStatus('Ваш ход')
                handleGameOver(newGame, playerColorRef.current)
                return newGame
            })
        } else if (msg.type === 'player_joined') {
            setGameStarted(true)
            setStatus('Игра началась! Ваш ход')
        } else if (msg.type === 'resign') {
            setStatus('Соперник сдался! 🏳️')
            setGameOver(true)
        }
    }, [handleGameOver])

    const handleWSOpen = useCallback(() => {
        if (mode === 'join') {
            wsRef.current?.send(JSON.stringify({ type: 'player_joined' }))
        }
    }, [mode])

    const { sendMessage, wsRef } = useWebSocket(
        mode !== 'bot' ? id! : '',
        handleWSMessage,
        handleWSOpen
    )

    useEffect(() => {
        if (mode === 'online') {
            setInviteLink(`${window.location.origin}/game/${id}?mode=join`)
            setPlayerColor('white')
            setGameStarted(false)
            setStatus('Ожидание соперника...')
        }

        if (mode === 'join') {
            if (joinedRef.current) return
            joinedRef.current = true

            setPlayerColor('black')
            playerColorRef.current = 'black'

            api.post(`/games/${id}/join`)
                .then(() => {
                    setGameStarted(true)
                    setStatus('Ход белых')
                })
                .catch(() => setStatus('Ошибка подключения'))
        }
    }, [mode, id])

    const onDrop = useCallback(({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
        if (!targetSquare) return false
        if (gameOver) return false
        if (!gameStarted) return false
        if (game.turn() !== playerColorRef.current[0]) return false

        const newGame = new Chess(game.fen())
        let move
        try {
            move = newGame.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
        } catch {
            return false
        }

        if (!move) return false

        setGame(newGame)
        setFen(newGame.fen())

        if (mode === 'bot') {
            setStatus('Бот думает...')
            getBestMove(newGame.fen())
        } else if (mode === 'online' || mode === 'join') {
            sendMessage({ type: 'move', from: sourceSquare, to: targetSquare, fen: newGame.fen() })
            setStatus('Ход соперника')
        }

        handleGameOver(newGame, playerColorRef.current)
        return true
    }, [game, gameOver, gameStarted, mode, getBestMove, sendMessage, handleGameOver])

    const handleResign = async () => {
        if (mode !== 'bot') {
            sendMessage({ type: 'resign' })
        }

        const gameData = await api.get(`/games/${id}`)
        const winnerId = gameData.data.white_id === user?.uid 
        ? gameData.data.black_id 
        : gameData.data.white_id

        await api.post(`/games/${id}/finish`, { winner_id: winnerId })
        setGameOver(true)
        setStatus('Вы сдались')
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center gap-4 p-4 ${bg}`}>
            <div className={`w-full max-w-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4 ${card}`}>
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-zinc-500 hover:text-zinc-300 transition"
                    >
                        ← Лобби
                    </button>
                    <span className={`text-sm px-3 py-1 rounded-full ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'}`}>
                        {mode === 'bot' ? '🤖 Бот' : '🌐 Онлайн'}
                    </span>
                </div>

                <h2 className="text-xl font-semibold text-center">{status}</h2>

                {mode === 'online' && inviteLink && (
                    <div className={`flex gap-2 p-3 rounded-xl ${isDark ? 'bg-zinc-700' : 'bg-zinc-100'}`}>
                        <input
                            value={inviteLink}
                            readOnly
                            className="flex-1 bg-transparent text-sm outline-none truncate"
                        />
                        <button
                            onClick={handleCopy}
                            className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
                        >
                            {copied ? '✓' : 'Копировать'}
                        </button>
                    </div>
                )}

                <div className="rounded-xl overflow-hidden">
                    <Chessboard
                        options={{
                            position: fen,
                            onPieceDrop: onDrop,
                            boardOrientation: playerColor,
                        }}
                    />
                </div>

                {!gameOver && (
                    <button
                        onClick={handleResign}
                        className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition"
                    >
                        🏳️ Сдаться
                    </button>
                )}

                {gameOver && (
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium transition"
                    >
                        В лобби
                    </button>
                )}
            </div>
        </div>
    )
}