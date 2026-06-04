import { useEffect, useState } from "react";
import CreateProduct from "../../components/createProduct/CreateProduct";
import InventoryCards from "../../components/inventoryCard/InventoryCards";
import { FolderKanban, Info } from "lucide-react";

const ProductList = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 100);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f8fafc]">
            <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
            <p className="text-brand-dark/40 font-black uppercase tracking-widest text-xs animate-pulse">Cargando...</p>
        </div>
    );

   return (
        <div className="min-h-screen bg-[#f8fafc] text-brand-dark font-sans tracking-tight p-6 md:p-10 animate-in fade-in duration-500">

            {/* HEADER */}
            <header className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12 pb-6 border-b border-slate-200/60">
                <div className="flex items-center gap-5">
                    <div className="bg-brand-primary p-3.5 rounded-2xl shadow-lg shadow-brand-dark/10 text-white">
                        <FolderKanban className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-brand-dark tracking-tighter uppercase italic leading-none">
                            Control de Stock
                        </h1>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.25em] mt-2">
                            Gestión de Productos • Ché, el mate
                        </p>
                    </div>
                </div>
            </header>

            {/* CONTENEDOR PRINCIPAL */}
            <main className="max-w-6xl mx-auto space-y-12">

                {/* SECCION DE CARGA */}
                <section id="add-product-section" className="space-y-4 flex flex-col items-center">
                    <div className="w-full flex items-center gap-3 px-2">
                        <div className="w-2 h-8 bg-brand-primary rounded-full" />
                        <h2 className="text-lg font-black text-brand-dark uppercase tracking-tight italic">
                            Cargar Producto
                        </h2>
                    </div>
                    
                    <div className="w-full flex justify-center">
                        <CreateProduct onProductCreated={() => setRefreshTrigger(prev => prev + 1)} />
                    </div>
                </section>

                <div className="relative flex py-4 items-center select-none">
                    <div className="flex-grow border-t border-slate-200/80"></div>
                    <span className="flex-shrink mx-4 bg-brand-light text-brand-primary font-black uppercase tracking-widest text-[9px] px-4 py-1.5 rounded-full shadow-brand-dark/10 italic">
                        Inventario
                    </span>
                    <div className="flex-grow border-t border-slate-200/80"></div>
                </div>

                {/* SECCION DE CATALOGO */}
                <section id="inventory-display-section" className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-2 h-8 bg-brand-primary rounded-full" />
                        <h2 className="text-lg font-black text-brand-dark uppercase tracking-tight italic">
                            Catálogo
                        </h2>
                    </div>

                    <div className="bg-brand-secondary p-6 md:p-10 rounded-[3rem] border border-stone-100/60 shadow-premium w-full">
                        <InventoryCards refreshTrigger={refreshTrigger} />
                    </div>
                </section>
                
            </main>

            {/* FOOTER */}
            <footer className="max-w-6xl mx-auto mt-20 pt-8 pb-8 border-t border-slate-200/60 text-center flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
                <p className="text-[10px] font-bold uppercase tracking-widest">
                    Ché el mate - Sistema de Gestión - v4.0
                </p>
                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-lg text-brand-dark/40 text-[10px] font-black uppercase tracking-wider">
                    <Info className="w-3 h-3" /> San Lorenzo, Santa Fe • 2026
                </div>
            </footer>
        </div>
    );
};

export default ProductList;