import { FastifyRequest } from 'fastify'
import { env } from '../../env'

export const logEndpointAccessed = async (
  request: FastifyRequest,
): Promise<void> => {
  if (env.NODE_ENV === 'development')
    console.log(`[${request.method}] ${request.url}`)
}
