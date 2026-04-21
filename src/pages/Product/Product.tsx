import { useEffect, useState } from "react";
import CreateProduct from "../../components/createProduct/CreateProduct";
import InventoryCards from "../../components/inventoryCard/InventoryCards";

const ProductList = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 100);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return (
        <div>
            <div>Cargando...</div>
        </div>
    );

    return (
        <div>

            {/* HEADER DE LA SECCIÓN DE INVENTARIO */}
            <header>
                <div>

                </div>
                <div>
                    <h1>
                        Control de Stock
                    </h1>
                    <p>
                        Gestión de Productos • Ché, el mate
                    </p>
                </div>
            </header>

            {/* CONTENEDOR PRINCIPAL */}
            <main>

                {/* SECCION DE CARGA: CreateProduct */}
                <section id="add-product-section">
                    <div>
                        <div></div>
                        <h2>
                            Cargar Producto
                        </h2>
                    </div>
                    <CreateProduct onProductCreated={() => setRefreshTrigger(prev => prev + 1)} />
                </section>

                {/* DIVISOR DE SECCIÓN */}
                <div>
                    <div>
                        Explorar Inventario
                    </div>
                </div>

                {/* SECCION DE VISUALIZACION: InventoryCards */}
                <section id="inventory-display-section">
                    <div>
                        <div></div>
                        <h2>Catálogo de Mercadería</h2>
                    </div>
                </section>
                <InventoryCards refreshTrigger={refreshTrigger} />
            </main>

            {/* FOOTER DE LA PÁGINA */}
            <footer>
                <p>
                    Ché el mate - Control de Stock - 2026
                </p>
            </footer>
        </div>
    )

}

export default ProductList;