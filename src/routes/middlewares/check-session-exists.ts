import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkSessionExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const session = request.cookies.session

  if (!session) return reply.status(401).send({ error: 'Não autorizado.' })
}
