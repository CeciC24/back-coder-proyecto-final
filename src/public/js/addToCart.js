const button = document.querySelector('.addToCartBtn')
const productID = button.getAttribute('productID')
const cartID = button.getAttribute('cartID')

button.addEventListener('click', (e) => {
	e.preventDefault()

	fetch('/api/cart/' + cartID + '/product/' + productID, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
	}).then((response) => {
		if (response.status != 200) {
			console.log('Algo salió mal')
		}
	})
})
