const purchaseButton = document.querySelector('.purchaseBtn')
const cartID = purchaseButton.getAttribute('cartID')

purchaseButton.addEventListener('click', (e) => {
	e.preventDefault()

	fetch('/api/cart/' + cartID + '/purchase', {
		method: 'POST',
	}).then((response) => {
		if (response.status === 200) {
            const cartContainer = document.querySelector('.cart-container')
            cartContainer.innerHTML = `
                <h2>Carrito</h2>
                <h4>¡Gracias por tu compra!</h4>
                <p>Si aún ves productos en tu carrito es porque no pudieron ser adquiridos por falta de stock.</p>
                <a href='/cart'>Volver al carrito</a>
                <a href='/products'>Volver a todos los productos</a>
            `
        } else {
            console.log('Algo salió mal')
        }
	})
})
