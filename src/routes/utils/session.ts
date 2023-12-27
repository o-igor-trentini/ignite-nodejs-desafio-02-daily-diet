import crypto from 'crypto'
import { FastifyRequest } from 'fastify'

export interface Session {
  id: string
  user: {
    id: string
    name: string
  }
}

export const getSession = (request: FastifyRequest): Session | null =>
  request.cookies?.session
    ? JSON.parse(request.cookies.session as string)
    : null

export const makeSession = (
  userId: string,
  userName: string,
  session: Session | null,
): Session =>
  !session
    ? {
        id: crypto.randomUUID(),
        user: { id: userId, name: userName },
      }
    : session
