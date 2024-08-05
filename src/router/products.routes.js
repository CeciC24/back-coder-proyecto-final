import { Router } from 'express'
import ProductManager from '../dao/mongo/products.mongo.js'
import ProductDTO from '../dao/DTOs/product.dto.js'

import { authorization } from '../middlewares/auth.middleware.js'
import { passportCall } from '../utils/jwt.utils.js'
import Validate from '../utils/validate.utils.js'
import { sendSimpleMail } from '../dao/services/email.service.js'
import config from '../config/environment.config.js'

const ProductMngr = new ProductManager()
const ProductRouter = Router()

ProductRouter.get('/', async (req, res, next) => {
	try {
		let limit = parseInt(req.query.limit)
		let page = parseInt(req.query.page)
		let sort = req.query.sort
		let query = req.query.query ? JSON.parse(req.query.query) : {}
		let populate = 'category'

		const response = await ProductMngr.getPaginated(page, limit, sort, query, populate)

		return res.status(200).json({ response })
	} catch (error) {
		next(error)
	}
})

ProductRouter.get('/:pid', async (req, res, next) => {
	try {
		let pid = req.params.pid

		Validate.id(pid, 'producto')
		await Validate.existID(pid, ProductMngr, 'producto')

		let product = await ProductMngr.getById(pid)
		res.status(200).send(product)
	} catch (error) {
		next(error)
	}
})

ProductRouter.post('/', passportCall('current'), authorization(['admin', 'premium']), async (req, res, next) => {
	try {
		let productData = req.body

		Validate.positiveNumber(productData.price, 'precio')
		Validate.positiveNumber(productData.stock, 'stock')
		await Validate.productData(productData)
		await Validate.existCode(productData.code, ProductMngr)

		const newProduct = new ProductDTO(productData)
		res.status(200).send(await ProductMngr.create(newProduct))
	} catch (error) {
		next(error)
	}
})

ProductRouter.put('/:pid', passportCall('current'), authorization(['admin', 'premium']), async (req, res, next) => {
	try {
		let pid = req.params.pid
		let newField = req.body
		const user = req.user.user
		const product = await ProductMngr.getById(pid)

		if (newField.price) Validate.positiveNumber(newField.price, 'precio')
		if (newField.stock) Validate.positiveNumber(newField.stock, 'stock')
		Validate.id(pid, 'producto')
		await Validate.existID(pid, ProductMngr, 'producto')
		Validate.isOwner(user, product)

		res.status(200).send(await ProductMngr.update(pid, newField))
	} catch (error) {
		next(error)
	}
})

ProductRouter.delete('/:pid', passportCall('current'), authorization(['admin', 'premium']), async (req, res, next) => {
	try {
		const pid = req.params.pid
		const user = req.user.user
		const product = await ProductMngr.getById(pid)

		Validate.id(pid, 'producto')
		await Validate.existID(pid, ProductMngr, 'producto')
		Validate.isOwner(user, product)
		
		const deletedProduct = await ProductMngr.delete(pid)
		
		if (user.role === 'premium')
			sendSimpleMail(
				config.emailUser,
				user.email,
				'Producto eliminado',
				`Hola ${user.first_name},
				<p>Le notificamos que el producto ${product.name} ha sido eliminado.</p>`
			)

		res.status(200).send(deletedProduct)
	} catch (error) {
		next(error)
	}
})

export default ProductRouter
