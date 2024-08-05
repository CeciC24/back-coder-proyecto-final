import supertest from 'supertest'
import * as chai from 'chai'

const expect = chai.expect
const requester = supertest.agent('http://localhost:8080')

describe('Test Product Router', () => {
	before(async () => {
		const userMock = {
			email: 'adminCoder@coder.com',
			password: 'adminCod3r123',
		}
		await requester.post('/api/sessions/login').send(userMock)
	})

	it('El endpoint POST /api/products debe crear un producto correctamente', async () => {
		const newProduct = {
			title: 'Producto Test',
			description: 'Producto para testing',
			price: 110,
			thumbnail: 'http://example.com/test-product.jpg',
			code: 'test1234',
			stock: 24,
			category: '663c0e6216fa47faa1537de5',
		}
		const { statusCode, ok, _body } = await requester.post('/api/products').send(newProduct).expect(200)
		expect(_body).to.be.an('object')
		expect(_body).to.have.property('_id')
	})

    it('No se puede crear el producto | El precio es menor a cero', async () => {
		const newProduct = {
			title: 'Producto Test',
			description: 'Producto para testing',
			price: -10,
			thumbnail: 'http://example.com/test-product.jpg',
			code: 'test2345',
			stock: 10,
			category: '663c0e6216fa47faa1537de5',
		}
		await requester.post('/api/products').send(newProduct).expect(400)
	})

    it('No se puede crear el producto | El stock es menor a cero', async () => {
		const newProduct = {
			title: 'Producto Test',
			description: 'Producto para testing',
			price: 10,
			thumbnail: 'http://example.com/test-product.jpg',
			code: 'test2345',
			stock: -10,
			category: '663c0e6216fa47faa1537de5',
		}
        await requester.post('/api/products').send(newProduct).expect(400)
	})

	it('Se obtienen todos los productos correctamente', async () => {
		const { statusCode, ok, _body } = await requester.get('/api/products').expect(200)
		expect(_body.response.payload).to.be.an('array')
	})

	it('Se obtiene un producto por ID correctamente', async () => {
		const { statusCode, ok, _body } = await requester.get('/api/products/663c0ea816fa47faa1537def').expect(200)
		expect(_body).to.be.an('object')
	})

	it('No se puede obtener producto | Producto no encontrado', async () => {
		await requester.get('/api/products/663c0ea816fa47faa1537de5').expect(404)
	})

	it('No se puede obtener producto | ID inválido', async () => {
		await requester.get('/api/products/663c0ea816fa47faa1537de').expect(400)
	})

	it('Se modifica un producto correctamente', async () => {
		const updatedProduct = {
			title: 'Nuevo nombre del producto 11',
			stock: 10,
		}
		const { statusCode, ok, _body } = await requester
			.put('/api/products/663e8c483df427152828fd0b')
			.send(updatedProduct)
			.expect(200)
		expect(_body).to.be.an('object')
	})

	it('Se elimina un producto correctamente', async () => {
		const { statusCode, ok, _body } = await requester.delete('/api/products/660e0ab2194c51f5a5fed71e').expect(200)
		expect(_body).to.be.an('object')
	})
})
