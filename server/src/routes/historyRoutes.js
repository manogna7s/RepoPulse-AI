/**
 * History routes map URLs to controllers — no business logic here.
 */

import { Router } from 'express'
import {
  deleteHistoryById,
  getHistory,
  getHistoryById,
} from '../controllers/historyController.js'

const historyRouter = Router()

historyRouter.get('/', getHistory)
historyRouter.get('/:id', getHistoryById)
historyRouter.delete('/:id', deleteHistoryById)

export default historyRouter
