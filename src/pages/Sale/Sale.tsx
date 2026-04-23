import { useEffect, useState } from "react";
import CreateSale from "../../components/createSale/CreateSale";
import SalesList from "../../components/saleList/SaleList";

const SalePage = () => {
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
    )

    return (
        <div>

            {/* HEADER E LA PÁGINA */}
            <header>
                <div>
                    <div></div>
                </div>
                <div>
                    <h1>Gestión de ventas</h1>
                    <p>
                        Panel de control • Ché, el mate
                    </p>
                </div>
            </header>

            {/* CONTENEDOR PRINCIPAL */}
            <main>

                {/* SECCIÓN DE CREACIÓN */}
                <section id="create-sale-section">
                    <div>
                        <div></div>
                        <h2>Nueva venta</h2>
                    </div>
                    <CreateSale onSaleCreated={() => setRefreshTrigger(prev => prev + 1)} refreshTrigger={refreshTrigger} />
                </section>

                {/* DIVISOR */}
                <div><hr /></div>

                {/* SECCIÓN DE HISTORIAL Y REPORTES */}
                <section id="sales-list-section">
                    <div>
                        <div></div>
                        <h2>Historial de ventas</h2>
                    </div>
                    <SalesList refreshTrigger={refreshTrigger} />
                </section>
            </main>

            {/* FOOTER */}
              <footer>
                <p>
                    Ché el mate - Control de Stock - 2026
                </p>
            </footer>
        </div>
    )
}

export default SalePage;