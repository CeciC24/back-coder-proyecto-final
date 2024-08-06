import mongoose from 'mongoose'

const { Schema } = mongoose
const collection = 'users'

const userSchema = new Schema({
	first_name: { type: String, required: true, index: true },
	last_name: { type: String, required: true },
	email: { type: String, unique: true },
	age: { type: Number, required: true },
	password: { type: String, required: true },
	cart: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'carts',
	},
	role: { type: String, enum: ['user', 'premium'], default: 'user' },
	last_connection: { type: Date, default: Date.now },
})

const UsersModel = mongoose.model(collection, userSchema)

export default UsersModel
