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
    const { isDark, toggle } = useThemeStore()

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
    const gameOverRef = useRef(false)
    const joinedRef = useRef(false)

    useEffect(() => { playerColorRef.current = playerColor }, [playerColor])

    const handleGameOver = useCallback(async (chess: Chess, color: 'white' | 'black') => {
        if (!chess.isGameOver()) return
        if (gameOverRef.current) return
        gameOverRef.current = true
        setGameOver(true)

        if (chess.isCheckmate()) {
            const loserColor = chess.turn()
            const iUserLost = (loserColor === 'w' && color === 'white') ||
                              (loserColor === 'b' && color === 'black')
            if (iUserLost) {
                setStatus('Вы проиграли! 😔')
            } else {
                setStatus('Вы выиграли! 🎉')
                if (mode !== 'bot') {
                    await api.post(`/games/${id}/finish`, { winner_id: user?.uid })
                }
            }
        } else {
            setStatus('Ничья! 🤝')
        }
    }, [id, user, mode])

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
        } else if (msg.type === 'opponent_disconnected') {
            setStatus('Соперник отключился! 🏳️')
            setGameOver(true)
            if (mode !== 'bot') {
                api.post(`/games/${id}/finish`, { winner_id: user?.uid })
            }
        }
    }, [handleGameOver, mode, id, user])

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
            const gameData = await api.get(`/games/${id}`)
            const winnerId = gameData.data.white_id === user?.uid
                ? gameData.data.black_id
                : gameData.data.white_id
            await api.post(`/games/${id}/finish`, { winner_id: winnerId })
        }
        setGameOver(true)
        setStatus('Вы сдались')
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const statusColor = gameOver
        ? status.includes('Выиграли') ? '#4d9e4d'
        : status.includes('Проиграли') ? '#c44'
        : 'var(--text2)'
        : 'var(--text)'

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
            {/* Header */}
            <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b flex-shrink-0"
                style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition hover:opacity-70"
                        style={{ background: 'var(--bg2)' }}
                    >
                        ←
                    </button>
                    <span className="text-sm font-medium px-3 py-1 rounded-full"
                        style={{ background: 'var(--bg2)', color: 'var(--text2)' }}>
                        {mode === 'bot' ? '🤖 Бот' : '🌐 Онлайн'}
                    </span>
                </div>
                <button
                    onClick={toggle}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg transition hover:opacity-70"
                    style={{ background: 'var(--bg2)' }}
                >
                    {isDark ? '☀️' : '🌙'}
                </button>
            </header>

            {/* Main */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 gap-4">
                {/* Status */}
                <div className="text-center">
                    <p className="text-lg font-semibold" style={{ color: statusColor }}>{status}</p>
                </div>

                {/* Invite link */}
                {mode === 'online' && inviteLink && (
                    <div className="w-full max-w-lg flex gap-2 p-3 rounded-2xl"
                        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                        <input
                            value={inviteLink}
                            readOnly
                            className="flex-1 bg-transparent text-sm outline-none truncate"
                            style={{ color: 'var(--text2)' }}
                        />
                        <button
                            onClick={handleCopy}
                            className="text-sm px-3 py-1 rounded-xl text-white transition flex-shrink-0"
                            style={{ background: copied ? '#4d9e4d' : '#4a7cc7' }}
                        >
                            {copied ? '✓ Скопировано' : 'Копировать'}
                        </button>
                    </div>
                )}

                {/* Board */}
                <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-xl">
                    <Chessboard
                        options={{
                            position: fen,
                            onPieceDrop: onDrop,
                            boardOrientation: playerColor,
                        }}
                    />
                </div>

                {/* Actions */}
                <div className="w-full max-w-lg">
                    {!gameOver && gameStarted && (
                        <button
                            onClick={handleResign}
                            className="w-full py-3 rounded-2xl font-medium text-white transition hover:opacity-90 active:scale-95"
                            style={{ background: '#c44' }}
                        >
                            🏳️ Сдаться
                        </button>
                    )}
                    {gameOver && (
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-3 rounded-2xl font-medium text-white transition hover:opacity-90 active:scale-95"
                            style={{ background: '#4d9e4d' }}
                        >
                            В лобби
                        </button>
                    )}
                </div>
            </main>
        </div>
    )
}