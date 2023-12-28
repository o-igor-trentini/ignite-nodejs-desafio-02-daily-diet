// eslint-disable-next-line
import {Knex} from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      created_at: string
      updated_at: string
      deleted_at?: string
      name: string
      password: string
    }
    meals: {
      id: string
      created_at: string
      updated_at: string
      deleted_at?: string
      name: string
      description: string
      in_the_diet: boolean
      meal_date: string
      meal_hour: string
      user_id: string
    }
  }
}
