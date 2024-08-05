import supertest from 'supertest'
import * as chai from 'chai'

const expect = chai.expect
const requester = supertest.agent('http://localhost:8080')

describe('Test Cart Router', () => {
	before(async () => {
		const userMock = {
			email: 'msmith@hogwarts.com',
			password: 'minerva',
		}
		await requester.post('/api/sessions/login').send(userMock)
	})

	it('El endpoint POST /api/cart debe crear un carrito correctamente', async () => {
		const { statusCode, ok, _body } = await requester.post('/api/cart')
		expect(_body).to.have.property('_id')
	})

	it('El endpoint GET /api/cart debe obtener todos los carritos correctamente', async () => {
		const { statusCode, ok, _body } = await requester.get('/api/cart')
		expect(_body).to.be.an('array')
	})

	it('El endpoint GET /api/cart/:cid debe obtener un carrito por ID correctamente', async () => {
		const { statusCode, ok, _body } = await requester.get('/api/cart/66aff20e87585adab7b52dd9')
		expect(_body).to.have.property('_id')
	})

	it('El endpoint POST /api/cart/:cid/product/:pid debe agregar un producto al carrito correctamente', async () => {
		const { statusCode, ok, _body } = await requester.post(
			'/api/cart/663e81653b4483c76a98b38f/product/663c0eee16fa47faa1537df5'
		)
		expect(statusCode).equal(200)
	})

	it('El endpoint DELETE /api/cart/:cid/product/:pid debe eliminar un producto del carrito correctamente', async () => {
		const { statusCode, ok, _body } = await requester.delete(
			'/api/cart/663e81653b4483c76a98b38f/product/663c0eee16fa47faa1537df5'
		)
		expect(statusCode).equal(200)
	})

	it('El endpoint DELETE /api/cart/:cid debe vaciar un carrito correctamente', async () => {
		const { statusCode, ok, _body } = await requester.delete('/api/cart/66aff20e87585adab7b52dd9')
		expect(statusCode).equal(200)
	})
})
