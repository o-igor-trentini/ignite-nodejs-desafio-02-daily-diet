import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import crypto from 'crypto'
import { knex } from '../database'
import {
  badRequestError,
  errorHandler,
  notFoundError,
} from './utils/errorHandler'
import { makeSession } from './utils/session'

export const users = async (app: FastifyInstance) => {
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

      reply.status(201)
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

      const session = makeSession(user.id, name)

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
