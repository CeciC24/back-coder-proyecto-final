import UsersModel from "../dao/mongo/models/users.model.js"

export default class UsersRepository {
    async create(userData) {
        return await UsersModel.create(userData)
    }

    async find() {
        return await UsersModel.find().populate('cart')
    }

    async findResume() {
        return await UsersModel.find().select('first_name last_name email role')
    }

    async findBy(field) {
        return await UsersModel.findOne(field)
    }

    async findById(id) {
        return await UsersModel.findById(id)
    }

    async updateOne(id, userData) {
        return await UsersModel.updateOne({ _id: id }, { $set: userData })
    }

    async findByIdAndDelete(id) {
        return await UsersModel.findByIdAndDelete(id)
    }

    /* async deleteInactives() {
        return await UsersModel.deleteMany({ last_connection: { $lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) } }) // 2 días
    } */

    async deleteInactives() {
        return await UsersModel.deleteMany({ last_connection: { $lt: new Date(Date.now() - 1000 * 60 * 30) } }) // 30 minutos
    }

    async getAllWithCart() {
        return await UsersModel.find().populate('cart.product')
    }

    async paginate(query, options) {
        return await UsersModel.paginate(query, options)
    }

    async toPremium(id) {
        return await UsersModel.updateOne({ _id: id }, { $set: { role: 'premium' } })
    }
}