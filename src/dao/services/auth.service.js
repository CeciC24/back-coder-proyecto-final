import UsersModel from '../mongo/models/users.model.js'
import { generateToken } from '../../utils/jwt.utils.js'
import { isValidPassword } from '../../utils/bcrypt.utils.js'
import UserManager from '../mongo/users.mongo.js'
import config from '../../config/environment.config.js'
import CustomError from '../../utils/customError.utils.js'
import ErrorTypes from '../../utils/errorTypes.utils.js'
import { sendSimpleMail } from './email.service.js'
import CartManager from '../mongo/carts.mongo.js'

const userMngr = new UserManager()
const cartMngr = new CartManager()

export default class AuthManager {
	constructor() {}

	async login({ email, password }) {
		if (!email || !password) {
			CustomError.createError({
				name: 'Error de autenticacion',
				message: 'Faltan datos',
				code: ErrorTypes.ERROR_DATA,
				cause: 'No se han enviado todos los datos necesarios',
			})
		}

		if (email === config.adminEmail && password === config.adminPassword) {
			const admin = {
				first_name: 'Coder',
				last_name: 'House',
				email: email,
				age: 10,
				role: 'admin',
			}
			const token = generateToken(admin)
			return { message: 'Autenticacion exitosa', token }
		}

		const user = await UsersModel.findOne({ email })
		if (!user) {
			CustomError.createError({
				name: 'Error de credenciales',
				code: ErrorTypes.ERROR_DATA,
			})
		}

		const valid = isValidPassword(user, password)
		if (!valid) {
			CustomError.createError({
				name: 'Error de credenciales',
				code: ErrorTypes.ERROR_DATA,
			})
		}

		userMngr.update(user._id, { last_connection: Date.now() })

		const token = generateToken(user)
		return { message: 'Autenticacion exitosa', token }
	}

	async logout(user, res) {
		if (!user) {
			CustomError.createError({
				name: 'Error al cerrar sesion',
				message: 'Usuario no encontrado',
				code: ErrorTypes.ERROR_DATA,
			})
		}

		userMngr.update(user._id, { last_connection: Date.now() })

		res.clearCookie(config.tokenCookieName).send({ status: 'success', message: 'Sesión cerrada' })
	}

	async register({ first_name, last_name, email, age, password }) {
		if (!first_name || !last_name || !email || !age || !password) {
			CustomError.createError({
				name: 'Error al registrar usuario',
				message: 'Faltan datos',
				code: ErrorTypes.ERROR_DATA,
				cause: 'No se han enviado todos los datos necesarios',
			})
		}

		const user = await UsersModel.findOne({ email })
		if (user) {
			CustomError.createError({
				name: 'Error al registrar usuario',
				code: ErrorTypes.ERROR_DATA,
				cause: 'El correo ya se encuentra registrado',
			})
		}

		const newCart = await cartMngr.create()

		const newUser = {
			first_name,
			last_name,
			email,
			age,
			password,
			cart: newCart._id,
		}

		const userCreated = await userMngr.create(newUser)

		const token = generateToken(userCreated)
		return { message: 'Registro exitoso', token }
	}

	async restore({ email, password }) {
		if (!email || !password) {
			CustomError.createError({
				name: 'Error al restaurar contraseña',
				message: 'Faltan datos',
				code: ErrorTypes.ERROR_DATA,
				cause: 'No se han enviado todos los datos necesarios',
			})
		}

		const user = await UsersModel.findOne({ email })
		if (!user) {
			CustomError.createError({
				name: 'Error de credenciales',
				code: ErrorTypes.ERROR_DATA,
			})
		}

		const updatedUser = await userMngr.update(user._id, { password: password })
		const token = generateToken(updatedUser)
		return { message: 'Contraseña restaurada', token }
	}

	async forgot({ email }) {
		if (!email) {
			CustomError.createError({
				name: 'Error restablecer contraseña',
				message: 'Faltan datos',
				code: ErrorTypes.ERROR_DATA,
				cause: 'No se han enviado todos los datos necesarios',
			})
		}

		const user = await UsersModel.findOne({ email })
		if (!user) {
			CustomError.createError({
				name: 'Error al restablecer contraseña',
				code: ErrorTypes.ERROR_DATA,
				cause: 'El correo no se encuentra registrado',
			})
		}

		const token = generateToken(user)
		const resetLink = config.railway == false ? `http://${config.host}:${config.port}/reset-password/${token}` : `https://${config.rwHost}/reset-password/${token}`

		const correoOptions = {
			from: config.emailUser,
			to: user.email,
			subject: 'Recuperación de contraseña',
			html: `
				Hola ${user.first_name},
				<p>Por favor, haz clic en el siguiente enlace para recuperar tu contraseña:</p> <a href="${resetLink}">Recuperar contraseña</a>
				<p>Si no solicitaste recuperar tu contraseña, por favor ignora este mensaje.</p>
			`,
		}

		await sendSimpleMail(correoOptions)

		return { message: 'Email de restablecimiento de contraseña enviado', token }
	}

	async reset({ email, password }) {
		if (!email || !password) {
			CustomError.createError({
				name: 'Error al restablecer contraseña',
				message: 'Faltan datos',
				code: ErrorTypes.ERROR_DATA,
				cause: 'No se han enviado todos los datos necesarios',
			})
		}

		const updatedUser = await userMngr.update(user._id, { password: password })
		const token = generateToken(updatedUser)
		return { message: 'Contraseña restablecida', token }
	}
}
