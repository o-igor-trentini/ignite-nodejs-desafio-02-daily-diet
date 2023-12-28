import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { errorHandler } from './utils/errorHandler'
import crypto from 'crypto'
import { checkSessionExists } from './middlewares/check-session-exists'
import { getSession } from './utils/session'

export const meals = async (app: FastifyInstance) => {
  app.addHook('preHandler', checkSessionExists)

  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const schema = z.object({
        name: z.string(),
        description: z.string(),
        datetime: z.coerce.date(),
        inTheDiet: z.boolean(),
      })
      const { name, description, datetime, inTheDiet } = schema.parse(
        request.body,
      )
      const date = datetime.toISOString().split('T')[0]
      const hour = ('0' + datetime.getHours()).slice(-2)
      const minutes = ('0' + datetime.getMinutes()).slice(-2)
      const session = getSession(request)

      await knex('meals').insert({
        id: crypto.randomUUID(),
        name,
        description,
        meal_date: date,
        meal_hour: hour + ':' + minutes,
        in_the_diet: inTheDiet,
        user_id: session?.user.id,
      })

      reply.status(201)
    } catch (err: unknown) {
      errorHandler(reply, err)
    }
  })

  app.get('/', async (request: FastifyRequest) => {
    const session = getSession(request)

    const meals = await knex('meals')
      .where('user_id', session?.user.id)
      .select()

    return { meals }
  })

  app.get('/:id', async (request: FastifyRequest) => {
    const schema = z.object({ id: z.string().uuid() })
    const { id } = schema.parse(request.params)
    const session = getSession(request)

    const meal = await knex('meals')
      .where({ id, user_id: session?.user.id })
      .first()

    return { meal }
  })
}
