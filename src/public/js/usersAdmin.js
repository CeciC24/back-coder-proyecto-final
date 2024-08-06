document.querySelectorAll('.saveRoleBtn').forEach((button) => {
	button.addEventListener('click', async (event) => {
		const userId = event.target.getAttribute('data-user-id')
		const selectElement = document.querySelector(`.user-role[data-user-id='${userId}']`)
		const newRole = selectElement.value

		try {
			const response = await fetch(`/api/users/${userId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ role: newRole }),
			})

			if (response.ok) {
				alert('Rol actualizado correctamente')
			} else {
				alert('Error al actualizar el rol')
			}
		} catch (error) {
			console.error('Error:', error)
			alert('Error al actualizar el rol')
		}
	})
})

document.querySelectorAll('.deleteUserBtn').forEach((button) => {
    button.addEventListener('click', async (event) => {
        const userId = event.target.getAttribute('data-user-id')

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (response.ok) {
                alert('Usuario eliminado correctamente')
                const userElement = document.querySelector(`.user[data-user-id='${userId}']`)
                if (userElement) {
                    userElement.remove()
                }
            } else {
                alert('Error al eliminar el usuario')
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Error al eliminar el usuario')
        }
    })
})