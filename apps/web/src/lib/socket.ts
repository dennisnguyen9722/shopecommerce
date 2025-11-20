// src/lib/socket.ts
import { io } from 'socket.io-client'

const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', {
  withCredentials: true,
  transports: ['websocket'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10
})

export default socket
