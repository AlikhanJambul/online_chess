import { useEffect, useRef, useCallback } from 'react'

export const useStockfish = (onBestMove: (move: string) => void) => {
    const workerRef = useRef<Worker | null>(null)

    useEffect(() => {
        const worker = new Worker(
            new URL('stockfish.js/src/stockfish.js', import.meta.url),
            { type: 'classic' }
        )

        worker.onmessage = (e: MessageEvent) => {
            const message = e.data as string
            if (message.startsWith('bestmove')) {
                const move = message.split(' ')[1]
                if (move && move !== '(none)') {
                    onBestMove(move)
                }
            }
        }

        worker.postMessage('uci')
        worker.postMessage('isready')
        workerRef.current = worker

        return () => worker.terminate()
    }, [])

    const getBestMove = useCallback((fen: string) => {
        if (!workerRef.current) return
        workerRef.current.postMessage(`position fen ${fen}`)
        workerRef.current.postMessage('go depth 12')
    }, [])

    return { getBestMove }
}