import { Router } from 'express'
import TicketsManager from '../dao/mongo/tickets.mongo.js'

import { authorization } from '../middlewares/auth.middleware.js'
import { passportCall } from '../utils/jwt.utils.js'

const TicketsMngr = new TicketsManager()
const TicketsRouter = Router()

TicketsRouter.get('/', async (req, res, next) => {
	try {
		res.status(200).send(await TicketsMngr.get())
	} catch (error) {
		next(error)
	}
})

TicketsRouter.get('/:tid', async (req, res, next) => {
	let tid = req.params.tid

	try {
		res.status(200).send(await TicketsMngr.getById(tid))
	} catch (error) {
		next(error)
	}
})

export default TicketsRouter
