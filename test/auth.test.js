import supertest from 'supertest'
import * as chai from 'chai'

const expect = chai.expect
const requester = supertest.agent('http://localhost:8080')

describe('Test Users Router', function () {
	this.timeout(5000)

	it('El usuario se registra correctamente', async () => {
		await requester
			.post('/api/sessions/register')
			.send({
				first_name: 'Regina',
				last_name: 'Mills',
				email: 'rmills@storybrooke.com',
				age: 38,
				password: 'henry',
			})
			.expect(201)
	})

	it('El usuario no puede registrarse | La edad ingresada en menor a cero', async () => {
		await requester
			.post('/api/sessions/register')
			.send({
				first_name: 'Regina',
				last_name: 'Mills',
				email: 'rmills@storybrooke.com',
				age: -38,
				password: 'henry',
			})
			.expect(400)
	})

	it('El usuario no puede registrarse | Faltan campos', async () => {
		await requester
			.post('/api/sessions/register')
			.send({
				first_name: 'Cosme',
				last_name: 'Fulanito',
				email: 'cfulanito@springfield.com',
				password: 'cosme',
			})
			.expect(400)
	})

	it('El usuario no puede registrarse | Correo ya registrado', async () => {
		await requester
			.post('/api/sessions/register')
			.send({
				first_name: 'Maggie',
				last_name: 'Smith',
				email: 'msmith@hogwarts.com',
				age: 66,
				password: 'minerva',
			})
			.expect(400)
	})

	it('El usuario se loguea correctamente', async () => {
		await requester
			.post('/api/sessions/login')
			.send({
				email: 'msmith@hogwarts.com',
				password: 'minerva',
			})
			.expect(200)
	})

	it('El usuario no puede loguearse | Password incorrecta', async () => {
		await requester
			.post('/api/sessions/login')
			.send({
				email: 'msmith@hogwarts.com',
				password: 'passIncorrecta',
			})
			.expect(400)
	})

	it('El usuario no puede loguearse | Correo no registrado', async () => {
		await requester
			.post('/api/sessions/login')
			.send({
				email: 'sinidentificar@fbi.com',
				password: 'topSecret',
			})
			.expect(400)
	})

	it('Se obtienen los datos de la sesión actual correctamente', async () => {
		await requester.get('/api/sessions/current').expect(200)
	})

	it('La sesión se cierra correctamente', async () => {
		await requester.post('/api/sessions/logout').expect(200)
	})

	it('Se restaura la contraseña del usuario correctamente', async () => {
		await requester
			.post('/api/sessions/restore')
			.send({
				email: 'housemd@mail.com',
				password: 'nuevaPass',
			})
			.expect(200)
	})

	it('No se restaura la contraseña del usuario | Correo no registrado', async () => {
		await requester
			.post('/api/sessions/restore')
			.send({
				email: 'severus@hogwarts.com',
				password: 'snape',
			})
			.expect(400)
	})

	it('No se restaura la contraseña del usuario | Faltan campos', async () => {
		await requester
			.post('/api/sessions/restore')
			.send({
				password: 'snape',
			})
			.expect(400)
	})

	it('Se envía un mail de recuperación de contraseña al usuario correctamente', async () => {
		await requester
			.post('/api/sessions/forgot-password')
			.send({
				email: 'ceciliacc3@gmail.com',
			})
			.expect(200)
	})

	it('Se convierte en premium un usuario correctamente', async () => {
		const userMock = {
			email: 'jbeals@porter.com',
			password: 'tinaaa',
		}
		await requester.post('/api/sessions/login').send(userMock)

		const { _body } = await requester.post('/api/sessions/premium').expect(200)
		expect(_body.role).to.be.equal('premium')
	})
})
