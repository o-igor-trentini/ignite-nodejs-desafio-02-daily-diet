export type Code = 'bad_request' | 'not_found' | 'validation' | 'unknown'

export class ApiError extends Error {
  constructor(mensagem: string, code: Code, errors?: []) {
    super(mensagem)
    this.name = 'ApiError'
    this.code = code
    this.errors = errors
  }

  code: Code
  errors?: []
}

export const customMessages: Record<string, string> = {
  Required: 'obrigatório',
  'Expected object, received number': 'deve ser um objeto',
}

export const statusCodeByErrorCode: Record<Code, number> = {
  bad_request: 400,
  not_found: 404,
  validation: 422,
  unknown: 500,
}
