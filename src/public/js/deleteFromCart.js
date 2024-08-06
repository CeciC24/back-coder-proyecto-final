const buttons = document.querySelectorAll('.deleteFromCartBtn')

buttons.forEach((button) => {
    button.addEventListener('click', (e) => {
        e.preventDefault()
        const productID = button.getAttribute('productID')
        const cartID = button.getAttribute('cartID')

        fetch('/api/cart/' + cartID + '/product/' + productID, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((response) => {
            if (response.status === 200) {
                const productElement = document.querySelector(`.product[data-product-id="${productID}"]`)
                if (productElement) {
                    const quantityElement = productElement.querySelector('.product-quantity')
                    const priceElement = productElement.querySelector('.product-price')
                    const productPrice = parseFloat(priceElement.textContent)
                    const newQuantity = parseInt(quantityElement.textContent) - 1
                    if (newQuantity > 0) {
                        quantityElement.textContent = newQuantity
                    } else {
                        productElement.remove()
                    }

                    const totalElement = document.querySelector('.total-price')
                    const currentTotal = parseFloat(totalElement.textContent)
                    const newTotal = currentTotal - productPrice
                    totalElement.textContent = newTotal.toFixed(2)
                }
            } else {
                console.log('Algo salió mal')
            }
        })
    })
})