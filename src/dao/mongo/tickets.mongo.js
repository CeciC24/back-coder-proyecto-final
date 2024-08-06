import { nanoid } from 'nanoid'
import TicketsRepository from '../../repositories/tickets.repository.js'
import CustomError from '../../utils/customError.utils.js'
import ErrorTypes from '../../utils/errorTypes.utils.js'

export default class TicketsManager {
	constructor() {
		this.repository = new TicketsRepository()
	}

	async create(newTicket) {
        let attempts = 0
        const maxAttempts = 5

        while (attempts < maxAttempts) {
            try {
                return await this.repository.create(newTicket)
            } catch (error) {
                if (error.code === 11000 && error.keyPattern && error.keyPattern.code) {
                    newTicket.code = nanoid(10)
                    attempts++
                } else {
                    CustomError.createError({
                        name: 'Error al crear ticket',
                        message: error.message,
                        code: ErrorTypes.ERROR_INTERNAL_ERROR,
                    })
                }
            }
        }

        CustomError.createError({
            name: 'Error al crear ticket',
            message: 'No se pudo generar un código único para el ticket después de varios intentos',
            code: ErrorTypes.ERROR_INTERNAL_ERROR,
        })
    }

	async get() {
		try {
			return await this.repository.find()
		} catch (error) {
			CustomError.createError({
				name: 'Error al obtener tickets',
				message: error.message,
				code: ErrorTypes.ERROR_INTERNAL_ERROR,
			})
		}
	}

	async getById(id) {
		try {
			return await this.repository.findById(id)
		} catch (error) {
			CustomError.createError({
				name: 'Error al obtener ticket',
				message: error.message,
				code: ErrorTypes.ERROR_INTERNAL_ERROR,
			})
		}
	}
}
