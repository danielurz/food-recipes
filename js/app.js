function iniciarApp() {

    const selectCategorias = document.querySelector('#categorias')
    const resultado = document.querySelector('#resultado')
    const modal = new bootstrap.Modal('#modal', {})

    if (selectCategorias) {
        selectCategorias.addEventListener('change', seleccionarCategoria)
        obtenerCategorias()
    } 

    const favoritosDiv = document.querySelector('.favoritos')
    if(favoritosDiv) {
        obtenerFavoritos()
    }


    function obtenerCategorias() {
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php'
        fetch(url).then(resultado => {
            return resultado.json()
        }).then(datos => {
            mostrarCategorias(datos.categories)
        })
    }


    function mostrarCategorias(categorias) {
        categorias.map(datos => {
            const option = document.createElement('option')
            const {strCategory:categoria} = datos

            option.value = categoria
            option.innerHTML = categoria
            selectCategorias.appendChild(option)
            })
        }
    
    
    function seleccionarCategoria(e) {
        const categoria = e.target.value
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`
        
        fetch(url).then(resultado => {
            return resultado.json();
        }).then(datos => {
            mostrarRecetas(datos.meals);
        })
        
    }
    
    function mostrarRecetas(recetas) {

        limpiarHTML(resultado)

        const heading = document.createElement('h2')
        heading.classList.add('text-center','text-black','my-5')
        heading.textContent = recetas.length ? `Resultados: ${recetas.length} recetas` : 'No hay resultados'
        resultado.appendChild(heading)

        recetas.map(receta => {
            const {idMeal:id,strMeal:meal,strMealThumb:img} = receta

            const recetaContenedor = document.createElement('div')
            const recetaCard = document.createElement('div')
            const recetaImagen = document.createElement('img')
            const recetaCardBody = document.createElement('div')
            const recetaHeading = document.createElement('h3')
            const recetaButton = document.createElement('button')

            recetaContenedor.classList.add('col-md-4')
            recetaCard.classList.add('card','mb-4')
            recetaImagen.classList.add('card-img-top')
            recetaCardBody.classList.add('card-body')
            recetaHeading.classList.add('card-title','mb-3')
            recetaButton.classList.add('btn','btn-danger','w-100')

            // recetaButton.dataset.bsTarget = "#modal"
            // recetaButton.dataset.bsToggle = "modal"

            recetaButton.onclick = function() {
                seleccionarReceta(id ?? receta.id)
            }
            
            recetaImagen.alt = `Imagen de la receta ${meal ?? receta.meal}`
            recetaImagen.src = img ?? receta.img
            recetaHeading.textContent = meal ?? receta.meal
            recetaButton.textContent = "Ver Receta"

            // APPEND HTML
            recetaCardBody.appendChild(recetaHeading)
            recetaCardBody.appendChild(recetaButton)
            recetaCard.appendChild(recetaImagen)
            recetaCard.appendChild(recetaCardBody)
            recetaContenedor.appendChild(recetaCard)
            resultado.appendChild(recetaContenedor)

        })
    }

    function seleccionarReceta(id) {
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`

        fetch(url).then(resultado => {
            return resultado.json()
        }).then(datos => {
            mostrarRecetaModal(datos.meals[0]);
        })
    }

    function mostrarRecetaModal(receta) {
        const {idMeal:id, strInstructions:instructions, strMeal:meal, strMealThumb:img} = receta

        //Añadir contenido al modal
        const modalTitle = document.querySelector('.modal .modal-title')
        const modalBody = document.querySelector('.modal .modal-body')

        modalTitle.textContent = meal
        modalBody.innerHTML = `
            <img class="img-fluid" src="${img}" alt="receta ${meal}"/>
            <h3 class="my-3">Instrucciones</h3>
            <p>${instructions}</p>
            <h3 class="my-3">Ingredientes y Cantidades</h3>
        `
        const listGroup = document.createElement('ul')
        listGroup.classList.add('list-group')
        //Mostrar cantidades e ingredientes
        for (i=1; i<=20; i++) {
            if(receta[`strIngredient${i}`]) {
                const ingrediente = receta[`strIngredient${i}`]
                const cantidad = receta[`strMeasure${i}`]

                const ingredienteLi = document.createElement('li')
                ingredienteLi.classList.add('list-group-item')
                ingredienteLi.textContent = `${ingrediente} - ${cantidad}`
                
                listGroup.appendChild(ingredienteLi)
            };
        }

        modalBody.appendChild(listGroup)

        const modalFooter = document.querySelector('.modal-footer')
        limpiarHTML(modalFooter)

        //Botones de cerrar y favorito
        const btnFavorito = document.createElement('button')
        btnFavorito.classList.add('btn','btn-danger','col')
        btnFavorito.textContent = existeStorage(id) ? 'Eliminar Favorito' : 'Guardar Favorito'

        // Localstorage

        btnFavorito.onclick = function() {
            if (existeStorage(id)) {
                eliminarFavorito(id)
                btnFavorito.textContent = 'Guardar Favorito'
                mostrarToast('Eliminado Correctamente')
                return
            }
            agregarFavorito({id,meal,img})
            btnFavorito.textContent = 'Eliminar Favorito'
            mostrarToast('Agregado Correctamente')
        }

        const btnCerrarModal = document.createElement('button')
        btnCerrarModal.classList.add('btn','btn-secondary','col')
        btnCerrarModal.textContent = "Cerrar"
        btnCerrarModal.onclick = function() {
            modal.hide()
        }

        modalFooter.appendChild(btnFavorito)
        modalFooter.appendChild(btnCerrarModal)

        //Mostrar el modal
        modal.show()
    }


    function agregarFavorito(receta) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []
        localStorage.setItem('favoritos',JSON.stringify([...favoritos, receta]))
    }

    function eliminarFavorito(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []
        const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id)
        localStorage.setItem('favoritos',JSON.stringify(nuevosFavoritos))
    }
    
    function existeStorage(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []
        return favoritos.some(favorito => favorito.id === id)
    }

    function mostrarToast(mensaje) {
        const toastDiv = document.querySelector('#toast')
        const toastBody = document.querySelector('.toast-body')
        const toast = new bootstrap.Toast(toastDiv)

        toastBody.textContent = mensaje
        toast.show()
    }

    function obtenerFavoritos() {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []
        if(favoritos.length) {
            mostrarRecetas(favoritos)
            return
        } 

        const noFavoritos = document.createElement('p')
        noFavoritos.textContent = 'No hay favoritos aun'
        noFavoritos.classList.add('fs-4','text-center','font-bold','mt-5')
        resultado.appendChild(noFavoritos)
    }

    function limpiarHTML(element) {
        while(element.firstChild) {
            element.removeChild(element.firstChild)
        }
    }
}


document.addEventListener('DOMContentLoaded',iniciarApp)