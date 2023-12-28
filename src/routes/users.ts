import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { logEndpointAccessed } from './middlewares/log-endpoint-accessed'
import { z } from 'zod'
import crypto from 'crypto'
import { knex } from '../database'
import {
  badRequestError,
  errorHandler,
  notFoundError,
} from './utils/errorHandler'
import { getSession, makeSession } from './utils/session'

export const users = async (app: FastifyInstance) => {
  app.addHook('preHandler', logEndpointAccessed)

  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const schema = z.object({
        name: z.string(),
        password: z.string(),
      })
      const { name, password } = schema.parse(request.body)

      const user = await knex('users').where({ name }).first()
      if (user) {
        badRequestError('Este usuário já esta cadastrado.')
        return
      }

      await knex('users').insert({
        id: crypto.randomUUID(),
        name,
        password,
      })
    } catch (err: unknown) {
      errorHandler(reply, err)
    }
  })

  app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const schema = z.object({
        name: z.string(),
        password: z.string(),
      })
      const { name, password } = schema.parse(request.body)

      const user = await knex('users').where({ name }).first()
      if (!user) {
        notFoundError('Usuário não encontrado.')
        return
      }

      if (password !== user.password) {
        badRequestError('Credenciais inválidas')
        return
      }

      let session = getSession(request)
      session = makeSession(user.id, name, session)

      reply.cookie('session', JSON.stringify(session), {
        httpOnly: true,
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      })
    } catch (err: unknown) {
      errorHandler(reply, err)
    }
  })

  app.post('/logout', async (_, reply: FastifyReply) => {
    reply.status(204).clearCookie('session')
  })
}
