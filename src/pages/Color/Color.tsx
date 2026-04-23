import { useEffect, useState } from "react";
import ColorList from "../../components/colorList/ColorList";
import CreateColor from "../../components/createColor/CreateColor";

const ColorPage = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [loading, setLoading] = useState(true);

     useEffect(() => {
            const timer = setTimeout(() => setLoading(false), 100);
            return () => clearTimeout(timer);
        }, []);

    if (loading) return (
        <div>
            <p>Cargando...</p>
        </div>
    )

    return (
        <div>

            {/* HEADER DE LA PÁGINA DE ESTILO */}
            <header>
                <div>
                    <h1>Estudio de Colores</h1>
                    <p>Gestión de colores • Ché, el mate</p>
                </div>
            </header>

            {/* CONTENEDOR PRINCIPAL */}
            <main>
                {/* SECCION DE CREACIÓN: CreateColor */}
                <section>
                    <div>
                        <h2>Crear Color</h2>
                    </div>
                    <CreateColor onColorCreated={() => setRefreshTrigger(prev => prev + 1)} />
                </section>

                <div>
                    <div>
                        Explorar colores
                    </div>
                </div>

                {/* SECCIÓN DE LISTADO: ColorList */}
                <section id="color-list-section">
                    <div>
                        <h2>Galeria de Colores</h2>
                    </div>
                    <ColorList refreshTrigger={refreshTrigger} />
                </section>
            </main>

            {/* FOOTER DE PÁGINA */}
             <footer>
                <p>
                    Ché el mate - Control de Stock - 2026
                </p>
            </footer>

        </div>
    )

}

export default ColorPage;