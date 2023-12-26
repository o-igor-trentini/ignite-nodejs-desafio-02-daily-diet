import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkSessionExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // TODO: Alterar de session ID para objeto

  const sessionId = request.cookies.sessionId

  if (!sessionId) return reply.status(401).send({ error: 'Não autorizado.' })
}
