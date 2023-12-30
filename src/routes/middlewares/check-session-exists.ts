import { FastifyReply, FastifyRequest } from 'fastify'
import { errorHandler, unauthorizedError } from '../utils/errorHandler'

export async function checkSessionExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const session = request.cookies.session

    if (!session) unauthorizedError('Não autorizado.')
  } catch (err: unknown) {
    errorHandler(reply, err)
  }
}
