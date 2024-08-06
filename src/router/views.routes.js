import { Router } from 'express'

import FSProductManager from '../dao/memory/products.memory.js'
import ProductsModel from '../dao/mongo/models/products.model.js'
import paginateFormat from '../paginateFormat.js'
import { requireAuth, redirectIfLoggedIn, authorization } from '../middlewares/auth.middleware.js'
import { passportCall, validateToken } from '../utils/jwt.utils.js'
import UserManager from '../dao/mongo/users.mongo.js'
import CartManager from '../dao/mongo/carts.mongo.js'
import config from '../config/environment.config.js'

const router = Router()

const usersMngr = new UserManager()
const cartsMngr = new CartManager()
const FSProductMngr = new FSProductManager('src/dao/memory/data/products.json')
const getFSProducts = FSProductMngr.get()

// File System routes
router.get('/home', async (req, res) => {
	// Cambié a /home para que no haya conflicto con el home de la nueva entrega
	let limit = parseInt(req.query.limit)

	try {
		const allProducts = await getFSProducts
		let productLimit = allProducts

		if (limit) {
			productLimit = allProducts.slice(0, limit)
		}

		const auth = req.isAuthenticated()
		
		res.render('homeFS', {
			title: 'Home',
			style: 'home.css',
			products: productLimit,
			auth,
		})
	} catch (error) {
		return res.status(500).send({ error: 'Error al obtener productos' })
	}
})

router.get('/realtimeproducts', async (req, res) => {
	try {
		let allProducts = await getFSProducts
		const auth = req.isAuthenticated()
		
		res.render('realTimeProducts', {
			title: 'Real time Products',
			style: 'realTimeProducts.css',
			products: allProducts,
			auth,
		})
	} catch (error) {
		return res.status(500).send({ error: 'Error al obtener productos' })
	}
})

// MongoDB routes
router.get('/products', passportCall('current'), async (req, res) => {
	const options = {
		page: parseInt(req.query.page) || 1,
		limit: parseInt(req.query.limit) || 10,
		sort: req.query.sort ? { price: req.query.sort } : null,
	}
	const query = req.query.query ? JSON.parse(req.query.query) : {}

	try {
		let result = await ProductsModel.paginate(query, options)
		const auth = req.isAuthenticated()
		
		let paginatedProducts = paginateFormat(result, '/products')

		res.render('allProducts', {
			title: 'Products',
			style: 'allProducts.css',
			products: JSON.parse(JSON.stringify(paginatedProducts.payload)),
			totalPages: paginatedProducts.totalPages,
			page: paginatedProducts.page,
			user: req.user.user,
			auth,
			notAdmin: auth ? req.user.user.role !== 'admin' : true,
			cartID: auth ? req.user.user.cart : "null",
		})
	} catch (error) {
		return res.status(500).send({ error: 'Error al obtener productos' })
	}
})

router.get('/products/:id', passportCall('current'), async (req, res) => {
	const id = req.params.id

	try {
		const product = await ProductsModel.findById(id).lean()
		const auth = req.isAuthenticated()
		
		if (!product) {
			return res.status(404).send({ error: 'Producto no encontrado' })
		}

		res.render('singleProduct', {
			title: product.title,
			style: '../../css/singleProduct.css',
			product: product,
			auth,
			notAdmin: auth ? req.user.user.role !== 'admin' : true,
			cartID: auth ? req.user.user.cart : "null",
		})
	} catch (error) {
		return res.status(500).send({ error: 'Error al obtener producto' })
	}
})

router.get('/cart', passportCall('current'), requireAuth, async (req, res) => {
	try {
		const cartID = req.user.user.cart
		const cart = await cartsMngr.getById(cartID)
		const products = cart.products
		const total = products.reduce((acc, p) => acc + p.product.price * p.quantity, 0)

		res.render('cart', {
			title: 'Carrito',
			style: '../../css/cart.css',
			products: JSON.parse(JSON.stringify(products)),
			total,
			auth: true,
			notAdmin: req.user.user.role !== 'admin',
			cartID,
		})
	} catch (error) {
		return res.status(500).send({ error: 'Error al obtener carrito' })
	}
})

router.get('/register', passportCall('current'), redirectIfLoggedIn, (req, res) => {
	res.render('register')
})

router.get('/login', passportCall('current'), redirectIfLoggedIn, (req, res) => {
	res.render('login', {
		emailsend: req.query.emailsend,
		success: req.query.success,
	})
})

router.get('/logout', passportCall('current'), requireAuth, (req, res) => {
	res.redirect('/login')
})

router.get('/profile', passportCall('current'), requireAuth, (req, res) => {
	const auth = req.isAuthenticated()

	res.render('profile', {
		user: req.user.user,
		auth,
		notAdmin: auth ? req.user.user.role !== 'admin' : true,
		cartID: auth ? req.user.user.cart : "null",
	})
})

router.get('/', passportCall('current'), (req, res) => {
	const auth = req.isAuthenticated()

	res.render('index', {
		user: req.user.user,
		auth,
		notAdmin: auth ? req.user.user.role !== 'admin' : true,
		cartID: auth ? req.user.user.cart : "null",
	})
})

router.get('/premium', passportCall('current'), requireAuth, authorization('user'), async (req, res) => {
	await usersMngr.toPremium(req.user.user._id)
	const auth = req.isAuthenticated()
	
	res.render('premium', {
		user: req.user.user,
		auth,
		notAdmin: auth ? req.user.user.role !== 'admin' : true,
		cartID: auth ? req.user.user.cart : "null",
	})
})

router.get('/restore', passportCall('current'), (req, res) => {
	const auth = req.isAuthenticated()
	
	res.render('restore', {
		title: 'Restore password',
		style: '../../css/restore.css',
		auth,
		notAdmin: auth ? req.user.user.role !== 'admin' : true,
		cartID: auth ? req.user.user.cart : "null",
	})
})

router.get('/reset-password/:token', passportCall('current'), async (req, res, next) => {
	try {
		const auth = req.isAuthenticated()
		const { token } = req.params

		const decodedToken = validateToken(token)
		if (!decodedToken) return res.redirect('/forgot-password?error=token')

		const email = decodedToken.user.email
		const actualUser = await usersMngr.getBy({ email })
		if (actualUser.password != decodedToken.user.password) return res.redirect('/forgot-password?error=token')

		res.render('resetPassword', {
			title: 'Reset password',
			style: '../../css/reset.css',
			auth,
			notAdmin: auth ? req.user.user.role !== 'admin' : true,
			cartID: auth ? req.user.user.cart : "null",
			error: req.query.error,
		})
	} catch (error) {
		next(error)
	}
})

router.get('/forgot-password', passportCall('current'), (req, res, next) => {
	try {
		const auth = req.isAuthenticated()
		const error = req.query.error

		res.render('forgotPassword', {
			title: 'Forgot password',
			style: '../../css/forgot.css',
			auth,
			notAdmin: auth ? req.user.user.role !== 'admin' : true,
			cartID: auth ? req.user.user.cart : "null",
			error,
		})
	} catch (error) {
		next(error)
	}
})

router.get('/users', passportCall('current'), authorization('admin'), async (req, res, next) => {
	const options = {
		page: parseInt(req.query.page) || 1,
		limit: parseInt(req.query.limit) || 10,
		sort: req.query.sort ? { role: req.query.sort } : null,
	}
	const query = req.query.query ? JSON.parse(req.query.query) : {}

	try {
		let result = await usersMngr.get(query, options)
		let paginatedUsers = paginateFormat(result, '/users')

		const auth = req.isAuthenticated()

		res.render('allUsers', {
			title: 'Users',
			style: 'allUsers.css',
			users: JSON.parse(JSON.stringify(paginatedUsers.payload)),
			totalPages: paginatedUsers.totalPages,
			page: paginatedUsers.page,
			user: req.user.user,
			auth,
			notAdmin: auth ? req.user.user.role !== 'admin' : true,
			cartID: auth ? req.user.user.cart : "null",
		})
	} catch (error) {
		next(error)
	}
})

export default router
