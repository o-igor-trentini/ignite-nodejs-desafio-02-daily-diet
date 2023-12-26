import { FastifyInstance } from 'fastify'
import { logEndpointAccessed } from './middlewares/log-endpoint-accessed'

export const meals = async (app: FastifyInstance) => {
  app.addHook('preHandler', logEndpointAccessed)
}
