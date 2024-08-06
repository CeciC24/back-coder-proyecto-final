import { createHash } from '../../utils/bcrypt.utils.js'
import UsersRepository from '../../repositories/users.repository.js'
import CustomError from '../../utils/customError.utils.js'
import ErrorTypes from '../../utils/errorTypes.utils.js'
import { sendSimpleMail } from '../services/email.service.js'
import config from '../../config/environment.config.js'
import CartManager from './carts.mongo.js'

export default class UserManager {
	constructor() {
		this.repository = new UsersRepository()
	}
	
	async get() {
		try {
			return await this.repository.find()
		} catch (error) {
			CustomError.createError({
				name: 'Error al obtener usuarios',
				message: error.message,
				code: ErrorTypes.ERROR_INTERNAL_ERROR,
			})
		}
	}

	async getBy(field) {
		try {
			return await this.repository.findBy(field)
		} catch (error) {
			CustomError.createError({
				name: 'Error al obtener usuario',
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
				name: 'Error al obtener usuario',
				message: error.message,
				code: ErrorTypes.ERROR_INTERNAL_ERROR,
			})
		}
	}
	
	async create(userData) {
		try {
			userData.password = createHash(userData.password)
			return await this.repository.create(userData)
		} catch (error) {
			CustomError.createError({
				name: 'Error al crear usuario',
				message: error.message,
				code: ErrorTypes.ERROR_INTERNAL_ERROR,
			})
		}
	}
	
	async update(id, userData) {
		try {
			if (userData.password) {
				userData.password = createHash(userData.password)
			}
			await this.repository.updateOne(id, userData)
			return await this.repository.findBy({ id })
		} catch (error) {
			CustomError.createError({
				name: 'Error al actualizar usuario',
				message: error.message,
				code: ErrorTypes.ERROR_INTERNAL_ERROR,
			})
		}
	}
	
	async delete(id) {
		const CartMngr = new CartManager()

		try {
			const user = await this.repository.findById(id)
			await CartMngr.delete(user.cart)
			return await this.repository.findByIdAndDelete(id)
		} catch (error) {
			CustomError.createError({
				name: 'Error al eliminar usuario',
				message: error.message,
				code: ErrorTypes.ERROR_INTERNAL_ERROR,
			})
		}
	}

	async deleteInactives() {
		try {
			const deletedUsers = await this.repository.deleteInactives()

			deletedUsers.forEach((user) => {
				sendSimpleMail({
					from: config.emailUser,
					to: user.email,
					subject: 'Cuenta eliminada por inactividad',
					html: `
						Hola ${user.first_name},
						<p>Tu cuenta ha sido eliminada por inactividad.</p>
					`,
				})
			})

			return deletedUsers
		} catch (error) {
			CustomError.createError({
				name: 'Error al eliminar usuarios inactivos',
				message: error.message,
				code: ErrorTypes.ERROR_INTERNAL_ERROR,
			})
		}
	}

	async getAllWithCart() {
		try {
			return await this.repository.getAllWithCart()
		} catch (error) {
			CustomError.createError({
				name: 'Error al obtener los usuarios con carritos',
				message: error.message,
				code: ErrorTypes.ERROR_INTERNAL_ERROR,
			})
		}
	}

	async getPaginated(page, limit, sort, query) {
		try {
			const options = {
				page: page || 1,
				limit: limit || 10,
				sort: sort ? { price: sort } : null,
			}
			return await this.repository.paginate(query, options)
		} catch (error) {
			CustomError.createError({
				name: 'Error al obtener usuarios paginados',
				message: error.message,
				code: ErrorTypes.ERROR_INTERNAL_ERROR,
			})
		}
	}

	async toPremium(id) {
		try {
			return await this.repository.toPremium(id)
		} catch (error) {
			CustomError.createError({
				name: 'Error al actualizar usuario a premium',
				message: error.message,
				code: ErrorTypes.ERROR_INTERNAL_ERROR,
			})
		}
	}
}
