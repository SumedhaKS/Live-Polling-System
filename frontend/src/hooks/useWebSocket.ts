import { useEffect, useRef } from 'react'

interface UseWebSocketProps {
  pollId: string
  onVoteUpdate: (results: any) => void
}

export const useWebSocket = ({ pollId, onVoteUpdate }: UseWebSocketProps) => {
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      // subscribe to this poll's updates
      ws.send(JSON.stringify({ type: 'subscribe', pollId }))
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.type === 'vote_update' && message.pollId === pollId) {
        onVoteUpdate(message.results)
      }
    }

    ws.onerror = (err) => console.error('WebSocket error:', err)

    // cleanup on unmount
    return () => ws.close()
  }, [pollId])
}