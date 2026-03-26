import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import type { Category } from "../../types";

// Definición de las props para el componente CategoryList
interface CategoryListProps {
    refreshTrigger: number; // Trigger para refrescar la lista
}

const CategoryList = ({ refreshTrigger}: CategoryListProps) => {
   const navigate = useNavigate();
   const [categories, setCategories] = useState<Category[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [errorMessage, setErrorMessage] = useState("");
   const [successMessage, setSuccessMessage] = useState("");
   const [showModal, setShowModal] = useState<string | null>(null); 

//Función para buscar categorías desde la API
    const fetchCategories = async () => {
        try {
            const response = await api.get("/categories");
            setCategories(response.data.data);
        } catch (err) {
            console.error("Error buscando categorías:", err);
            setErrorMessage("Error al cargar categorías. Por favor, inténtalo de nuevo.");
            setTimeout(() => setErrorMessage(""), 2000); // Limpiar mensaje después de 2 segundos
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCategories();
    }, [refreshTrigger])

     const handleToggleActive = async (id: string, isActive: boolean) => {
        try {
            const endpoint = isActive ? "deactivate" : "activate";
            const response = await api.patch(`/categories/${id}/${endpoint}`);
            
            if (!response.data.error) {
                setCategories(prev => prev.map(cat => 
                    cat._id === id ? { ...cat, isActive: !isActive } : cat
                ));
            }
            setSuccessMessage(isActive ? "Categoría desactivada correctamente" : "Categoría activada correctamente");
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (err) {
            console.error("Error cambiando el estado de la categoría:", err);
            setErrorMessage("No se puede desactivar esta categoría porque está asociada a un producto");
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

       const handleDelete = async (id: string) => {
        try {
            await api.delete(`/categories/${id}`);
            setCategories(prev => prev.filter(cat => cat._id !== id));
            setSuccessMessage("Categoría eliminada correctamente");
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (err) {
            console.error("Error eliminando la categoría:", err);
            setErrorMessage("No se puede eliminar esta categoría porque está asociada a un producto");
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    // Filtrar categorías según el término de búsqueda
    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Cargando categorías...</div>;

    return (
        <section>
            {/* HEADER Y BUSCADOR */}
            <div>
            <div>
                <h1>Categorias</h1>
                <p>Estructura de inventario</p>
            </div>
            <div>
                <input
                    type="text"
                    placeholder="Buscar categorías..."
                    className=""
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                ></input>
            </div>
            </div>
            {/* MENSAJES DE ESTADO */}
            {errorMessage && (<div className="alert alert-danger">{errorMessage}</div>)}
            {successMessage && (<div className="alert alert-success">{successMessage}</div>)}

        <div>
            {/* GRID DE CATEGORIAS */}
         {filteredCategories.map(category => (
            <div
            key={category._id}
            onClick={() => navigate(`/edit-category/${category._id}`)}
            className={`${!category.isActive ? 'inactive-category' : ''} category-item`}
            >
            <div>
                <h3>{category.name}</h3>
            </div>
            {/* INDICADOR DE ESTADO */}
            <div>
            <div className={`${category.isActive  ? 'active-indicator' : 'inactive-indicator'}`}>
                <span>
                    {category.isActive ? "Activo" : "Inactivo"}
                </span>
            </div>

            {/* BOTÓN DE ACTIVAR/DESACTIVAR */}
            <div>
                <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleToggleActive(category._id, category.isActive)
                }}
                className={`${category.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                >
                    {category.isActive? "Desactivar" : "Activar"}
                </button>

                <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(category._id)
                }}
                >
                    X
                </button>
            </div>

                </div>
            </div>
         ))}   
        </div>
         
         {/* ESTADO VACIO */}
         {filteredCategories.length === 0 && (
            <div>
                <p>No se encontraron categorías.</p>
            </div>
         )}

         {/* MODAL DE ELIMINACION */}

         {showModal && (
            <div>
                <h3>¿Eliminar categoría?</h3>
                <p>Esta operacion fallara si la categoría está asociada a un producto.</p>
                <div>
                    <button
                    onClick={() => { handleDelete(showModal); setShowModal(null); }}
                    className=""
                    >
                        Confirmar
                    </button>
                    <button
                    onClick={() => setShowModal(null)}
                    className=""
                    >

                    </button>
                </div>
            </div>
         )}

        </section>
    )
}

export default CategoryList;