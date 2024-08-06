import passport from 'passport'
import jwt from 'passport-jwt'
import GitHubStrategy from 'passport-github2'
import axios from 'axios';
import { generateToken } from '../utils/jwt.utils.js';
import config from './environment.config.js'

import UsersModel from '../dao/mongo/models/users.model.js'
import UserManager from '../dao/mongo/users.mongo.js'
import CartManager from '../dao/mongo/carts.mongo.js';

const JWTStrategy = jwt.Strategy
const ExtractJWT = jwt.ExtractJwt
const userMngr = new UserManager()
const cartMngr = new CartManager()

const initializePassport = () => {
	const cookieExtractor = (req) => {
		let token = null
		if (req && req.cookies) {
			token = req.cookies[config.tokenCookieName]
		}
		return token
	}

	passport.use(
		'current',
		new JWTStrategy(
			{
				jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
				secretOrKey: config.jwtSecret, // El mismo que en utils.js
			},
			async (jwt_payload, done) => {
				try {
					return done(null, jwt_payload)
				} catch (error) {
					return done(error)
				}
			}
		)
	)

	passport.use(
		'github',
		new GitHubStrategy(
			{
				clientID: config.railway == "true" ? config.gitClientIDRailway : config.gitClientID,
				clientSecret: config.railway == "true" ? config.gitClientSecretRailway : config.gitClientSecret,
				callbackURL: config.railway == "true" ? config.gitCallbackURLRailway : config.gitCallbackURL,
			},
			async (accessToken, refreshToken, profile, done) => {
				try {
					const emailResponse = await axios.get('https://api.github.com/user/emails', {
						headers: {
							Authorization: `token ${accessToken}`,
						},
					})

					const email = emailResponse.data.find((email) => email.primary).email

					let user = await UsersModel.findOne({ email: email })
					let githubUser = user
					if (!user) {
						const newCart = await cartMngr.create()
						user = {
							first_name: profile._json.name,
							last_name: ' ',
							email,
							age: 0,
							password: 'githubSecretPass24',
							cart: newCart._id,
						}
						githubUser = await userMngr.create(user)
					}

					const token = generateToken(githubUser)
					return done(null, { ...githubUser, token })
				} catch (error) {
					return done(null, false, { message: error.message })
				}
			}
		)
	)

	passport.serializeUser((user, done) => {
		done(null, user)
	})

	passport.deserializeUser((user, done) => {
		try {
			done(null, user)
		} catch (error) {
			done(error)
		}
	})
}

export default initializePassport
