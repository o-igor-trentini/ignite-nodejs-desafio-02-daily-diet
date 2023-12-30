import crypto from 'crypto'
import { FastifyRequest } from 'fastify'
import { unauthorizedError } from './errorHandler'

export interface Session {
  id: string
  user: {
    id: string
    name: string
  }
}

export const getSession = (request: FastifyRequest): Session => {
  if (!request.cookies?.session) unauthorizedError('Não autorizado.')

  return JSON.parse(request.cookies.session as string)
}

export const makeSession = (userId: string, userName: string): Session => ({
  id: crypto.randomUUID(),
  user: { id: userId, name: userName },
})
