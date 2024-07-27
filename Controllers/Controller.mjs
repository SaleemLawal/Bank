import { Router } from 'express'
import userRoutes from './UserController.mjs'
import accountRoutes from './AccountsController.mjs'

const routes = Router()

routes.use('/api', userRoutes)
routes.use('/api', accountRoutes)

export default routes