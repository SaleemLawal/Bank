import { Router } from 'express'
import userRoutes from './UserController.mjs'
import accountRoutes from './AccountsController.mjs'
import transactionRoutes from './TransactionsController.mjs'

const routes = Router()

routes.use('/api', userRoutes)
routes.use('/api', accountRoutes)
routes.use('/api', transactionRoutes)

export default routes