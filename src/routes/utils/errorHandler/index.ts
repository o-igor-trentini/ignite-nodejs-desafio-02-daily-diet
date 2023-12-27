import { ZodError } from 'zod'
import { FastifyReply } from 'fastify'
import { ApiError, customMessages, statusCodeByErrorCode } from './types'

export const errorHandler = (reply: FastifyReply, err: unknown): void => {
  if (err instanceof ZodError) {
    reply.status(422).send({
      code: 'validation',
      message: 'Não foi possível identificar a estrutura dos dados.',
      errors: err.errors.map(({ message, path }) => ({
        field: Array.isArray(path) ? path.join('.') : path,
        message: customMessages[message] ?? message,
      })),
    })
  }

  if (err instanceof ApiError) {
    reply
      .status(statusCodeByErrorCode[err.code])
      .send({ code: err.code, message: err.message } as ApiError)
  }

  reply.status(500).send({
    code: 'unknown',
    message: 'Não foi possível identificar o erro.',
  })
}

export const badRequestError = (message: string): void => {
  throw new ApiError(message, 'bad_request')
}

export const notFoundError = (message: string): void => {
  throw new ApiError(message, 'not_found')
}
