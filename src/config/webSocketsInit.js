import FSCartManager from '../dao/memory/carts.memory.js'
import FSProductManager from '../dao/memory/products.memory.js'
import { Server } from 'socket.io'
import CartManager from '../dao/mongo/carts.mongo.js'

// Inicialización de Websockets (File System)
export default function webSocketsInit(server) {
    try {
        const FSProductMngr = new FSProductManager('src/dao/memory/data/products.json')
    
        const io = new Server(server)
        server.on('error', (error) => console.error(`Server error: ${error}`))
    
        io.on('connection', (socket) => {
            console.log('Nuevo cliente conectado')
    
            socket.on('addProduct', async (product) => {
                try {
                    const productAdded = await FSProductMngr.create(product)
                    io.emit('addToTheList', productAdded)
                } catch (error) {
                    console.error(error.message)
                }
            })
    
            socket.on('deleteProduct', async (productID) => {
                try {
                    await FSProductMngr.delete(productID)
                    io.emit('deleteFromList', productID)
                } catch (error) {
                    console.error(error.message)
                }
            })
        })
    } catch (error) {
        throw new Error('No se pudieron inicializar los websockets: ' + error.message)
    }
}