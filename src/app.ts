import fastify from 'fastify'
import { meals } from './routes/meals'
import cookie from '@fastify/cookie'
import { users } from './routes/users'
import { logEndpointAccessed } from './routes/middlewares/log-endpoint-accessed'

export const app = fastify()

app.register(cookie)
app.addHook('preHandler', logEndpointAccessed)
app.register(users, { prefix: 'users' })
app.register(meals, { prefix: 'meals' })
