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
      const hour = ('0' + datetime.getUTCHours()).slice(-2)
      const minutes = ('0' + datetime.getUTCMinutes()).slice(-2)
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
      .whereNull('deleted_at')
      .select()

    return { meals }
  })

  app.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const schema = z.object({ id: z.string().uuid() })
      const { id } = schema.parse(request.params)
      const session = getSession(request)

      const meal = await knex('meals')
        .where({ id, user_id: session?.user.id })
        .whereNull('deleted_at')
        .first()

      return { meal }
    } catch (err: unknown) {
      errorHandler(reply, err)
    }
  })

  app.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const schema = z.object({ id: z.string().uuid() })
      const { id } = schema.parse(request.params)
      const session = getSession(request)

      await knex('meals')
        .where({ id, user_id: session?.user.id })
        .whereNull('deleted_at')
        .update({ deleted_at: knex.fn.now() })

      reply.status(204)
    } catch (err: unknown) {
      errorHandler(reply, err)
    }
  })

  app.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const paramsSchema = z.object({ id: z.string().uuid() })
      const { id } = paramsSchema.parse(request.params)
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
      const hour = ('0' + datetime.getUTCHours()).slice(-2)
      const minutes = ('0' + datetime.getUTCMinutes()).slice(-2)
      const session = getSession(request)

      await knex('meals')
        .where({ id, user_id: session?.user.id })
        .whereNull('deleted_at')
        .update({
          name,
          description,
          meal_date: date,
          meal_hour: hour + ':' + minutes,
          in_the_diet: inTheDiet,
        })

      reply.status(204)
    } catch (err: unknown) {
      errorHandler(reply, err)
    }
  })

  app.get('/summary', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const session = getSession(request)

      const meals = await knex('meals')
        .select('in_the_diet')
        .where('user_id', session?.user.id)

      let totalInTheDiet = 0
      let bestSequence = 0
      let currentSequence = 0
      for (const meal of meals) {
        if (!meal.in_the_diet) {
          currentSequence = 0
          continue
        }

        totalInTheDiet++
        currentSequence++
        bestSequence = Math.max(bestSequence, currentSequence)
      }

      const totalOutTheDiet = meals.length - totalInTheDiet

      return {
        summary: {
          total: meals.length,
          total_in_the_diet: totalInTheDiet,
          total_out_the_diet: totalOutTheDiet,
          diet_best_sequence: bestSequence,
        },
      }
    } catch (err: unknown) {
      errorHandler(reply, err)
    }
  })
}
