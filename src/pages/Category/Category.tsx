import { useEffect, useState } from "react";
import CategoryList from "../../components/categoryList/CategoryList";
import CreateCategory from "../../components/createCategory/CreateCategory";

const CategoryPage = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 100);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return (
        <div>
            <div>Cargando categorías...</div>
        </div>
    )

    return (
        <div>
        
        {/* HEADER DE LA PAGINA DE CATEGORIAS */}
        <header>
        <div>
            <h1>Estructura de Stock</h1>
            <p>Gestión de Categorías • Ché el mate System</p>
        </div>
        </header>

        {/* CONTENEDOR PRINCIPAL */}
        <main>
        
        {/* SECCIÓN DE CREACIÓN */}
        <section>
            <div>
                <h2>Añadir Clasificacion</h2>
            </div>
            <CreateCategory onCategoryCreated={() => setRefreshTrigger(prev => prev + 1)} />
        </section>

        {/* SECCION DE LISTADO: CategoryList */}
        <section>
            <div>
                <h2>Galería de categorías</h2>
            </div>
            <CategoryList refreshTrigger={refreshTrigger} />
        </section>
        </main>
        <footer>
            <p>
                Ché el mate System • 2026
            </p>
        </footer>
        </div>
    )
}

export default CategoryPage;