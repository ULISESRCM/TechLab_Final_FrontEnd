const API_URL = "http://localhost:8080/api"; // Ajusta si tu backend usa otro puerto

// Cargar productos al iniciar
document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    setupForm();
});

// 1. Mostrar todos los productos
async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/mostrarproductos`);
        if (!response.ok) throw new Error("Error al cargar productos");
        const productos = await response.json();

        const container = document.getElementById("productosContainer");
        container.innerHTML = "";

        productos.forEach(producto => {
            container.innerHTML += renderProductoCard(producto);
        });
    } catch (error) {
        console.error("Error:", error);
    }
}

// 2. Agregar producto (POST)
function setupForm() {
    const form = document.getElementById("productForm");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nuevoProducto = {
            nombre: document.getElementById("nombre").value,
            descripcion: document.getElementById("descripcion").value,
            price: parseFloat(document.getElementById("precio").value),
            categoria: document.getElementById("categoria").value,
            imagen: document.getElementById("imagen").value,
            stock: document.getElementById("stock").checked
        };

        try {
            const response = await fetch(`${API_URL}/agregarproducto`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(nuevoProducto)
            });

            if (!response.ok) throw new Error("Error al agregar");

            form.reset();
            cargarProductos(); // Recargar lista
        } catch (error) {
            console.error("Error:", error);
        }
    });
}

// 3. Eliminar producto (DELETE)
async function eliminarProducto(id) {
    if (!confirm("¿Eliminar este producto?")) return;

    try {
        const response = await fetch(`${API_URL}/eliminar/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error("Error al eliminar");
        cargarProductos();
    } catch (error) {
        console.error("Error:", error);
    }
}

// Renderiza cada tarjeta de producto con los botones Editar y Eliminar
function renderProductoCard(producto) {
    const stockDisponible = producto.stock === 1 || producto.stock === "1" || producto.stock === true;
    return `
        <div class="col-md-4">
            <div class="card">
                ${producto.imagen ? `<img src="${producto.imagen}" class="card-img-top product-img" alt="${producto.nombre}">` : ""}
                <div class="card-body">
                    <h5 class="card-title">${producto.nombre}</h5>
                    <p class="card-text">${producto.descripcion}</p>
                    <p class="card-text">Precio: $${producto.price}</p>
                    <p class="card-text">Categoría: ${producto.categoria}</p>
                    <p class="card-text">Stock: ${stockDisponible ? "Disponible" : "Sin stock"}</p>
                    <button onclick="editarProducto(${producto.idProducto})" class="btn btn-warning btn-sm me-2">Editar</button>
                    <button onclick="eliminarProducto(${producto.idProducto})" class="btn btn-danger btn-sm">Eliminar</button>
                </div>
            </div>
        </div>
    `;
}

// Adaptación para usar el modal de edición
window.editarProducto = async function(idProducto) {
    try {
        // Usar tu endpoint real para obtener el producto
        const response = await fetch(`${API_URL}/buscar/${idProducto}`);
        if (!response.ok) throw new Error("No se pudo obtener el producto");
        const producto = await response.json();

        // Rellenar los campos del modal
        document.getElementById("editarIdProducto").value = producto.idProducto;
        document.getElementById("editarNombre").value = producto.nombre;
        document.getElementById("editarDescripcion").value = producto.descripcion;
        document.getElementById("editarPrecio").value = producto.price;
        document.getElementById("editarCategoria").value = producto.categoria;
        document.getElementById("editarImagen").value = producto.imagen;
        document.getElementById("editarStock").checked = !!producto.stock;

        // Mostrar el modal (Bootstrap 5)
        const modal = new bootstrap.Modal(document.getElementById('editarProductoModal'));
        modal.show();

    } catch (error) {
        alert("Error al cargar producto para editar");
    }
};

// Maneja el submit del formulario de edición del modal
document.getElementById("editarProductoForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const idProducto = document.getElementById("editarIdProducto").value;
    const productoActualizado = {
        nombre: document.getElementById("editarNombre").value,
        descripcion: document.getElementById("editarDescripcion").value,
        price: parseFloat(document.getElementById("editarPrecio").value),
        categoria: document.getElementById("editarCategoria").value,
        imagen: document.getElementById("editarImagen").value,
        stock: document.getElementById("editarStock").checked
    };

    try {
        const response = await fetch(`${API_URL}/actualizar/${idProducto}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(productoActualizado)
        });

        if (!response.ok) throw new Error("Error al actualizar");

        // Cierra el modal
        bootstrap.Modal.getInstance(document.getElementById('editarProductoModal')).hide();
        cargarProductos(); // Recargar lista
    } catch (error) {
        alert("Error al actualizar producto");
    }
});