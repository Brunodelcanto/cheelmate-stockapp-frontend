import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import type { Category } from "../../types";
import { 
  Search, SlidersHorizontal, Play, Pause, 
  Trash2, ShieldAlert, CheckCircle, Tags 
} from "lucide-react";

interface CategoryListProps {
    refreshTrigger: number;
}

const CategoryList = ({ refreshTrigger }: CategoryListProps) => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showModal, setShowModal] = useState<string | null>(null); 

    const fetchCategories = async () => {
        try {
            const response = await api.get("/categories");
            setCategories(response.data.data);
        } catch (err) {
            console.error("Error buscando categorías:", err);
            setErrorMessage("Error al cargar categorías. Por favor, inténtalo de nuevo.");
            setTimeout(() => setErrorMessage(""), 2000);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [refreshTrigger]);

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
            setErrorMessage("No se puede pausar esta categoría porque está asociada a un producto");
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

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-[300px] flex flex-col items-center justify-center gap-4 bg-transparent">
            <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
            <p className="text-brand-dark/40 font-black uppercase tracking-widest text-xs animate-pulse">Cargando...</p>
        </div>
    );

    return (
        <section className="space-y-10">
            
            {/* HEADER Y BUSCADOR */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] shadow-pop border border-slate-100/60">
                <div className="flex items-center gap-4">
                    <div className="bg-[#f4f6f9] p-3.5 rounded-2xl text-brand-primary shadow-inner">
                        <SlidersHorizontal className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-brand-dark uppercase tracking-tighter italic leading-none">Categorías</h1>
                        <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] mt-1.5">Segmentación de categorias</p>
                    </div>
                </div>

                <div className="relative flex items-center md:w-80">
                    <Search className="w-4 h-4 text-brand-dark/30 absolute left-4" />
                    <input
                        type="text"
                        placeholder="Buscar categoría..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#f4f6f9] text-[#1e293b] font-bold text-xs pl-12 pr-4 py-3.5 rounded-xl border border-transparent focus:bg-white focus:border-brand-primary/40 outline-none placeholder:text-slate-400 transition-all shadow-inner"
                    />
                </div>
            </div>

            {successMessage && (
                <div className="p-4 bg-brand-accent/10 border border-brand-accent/20 rounded-xl text-brand-accent font-bold text-sm flex items-center gap-3 animate-in fade-in duration-300">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" /> {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="p-4 bg-brand-alert/10 border border-brand-alert/20 rounded-xl text-brand-alert font-bold text-sm flex items-center gap-3 animate-in fade-in duration-300">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0" /> {errorMessage}
                </div>
            )}

            {/* GRILLA DE TARJETAS DE CATEGORÍA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map(category => (
                    <div
                        key={category._id}
                        onClick={() => navigate(`/edit-category/${category._id}`)}
                        className={`group/card relative bg-white rounded-[2.2rem] shadow-pop border border-slate-100/80 p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-pop-hover cursor-pointer overflow-hidden ${!category.isActive ? "opacity-75 bg-slate-50/50" : ""}`}
                    >
                        <div className="w-16 h-16 bg-[#f4f6f9] border border-slate-100 rounded-full mb-4 flex items-center justify-center text-brand-dark/30 transition-all duration-300 group-hover/card:scale-105 group-hover/card:text-brand-primary group-hover/card:bg-brand-primary/5">
                            <Tags className="w-6 h-6" />
                        </div>
                        
                        <h3 className="text-base font-black text-brand-dark uppercase tracking-tight italic mb-4 group-hover/card:text-brand-primary transition-colors">
                            {category.name}
                        </h3>

                        <div className="absolute top-4 left-4 flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${category.isActive ? "bg-brand-active" : "bg-slate-400"}`} />
                            <span className="text-[9px] font-black text-brand-dark/30 uppercase tracking-wider">
                                {category.isActive ? "Activo" : "Inactivo"}
                            </span>
                        </div>

                        {/* ACCIONES DEL FOOTER */}
                        <div className="flex items-center gap-2 mt-auto w-full border-t border-slate-100 pt-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleActive(category._id, category.isActive);
                                }}
                                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all duration-200 active:scale-95 cursor-pointer ${category.isActive ? "bg-slate-50 text-brand-dark/70 border-slate-200 hover:bg-brand-dark hover:text-white hover:border-transparent" : "bg-brand-accent/10 text-brand-accent border-brand-accent/10 hover:bg-brand-accent hover:text-white"}`}
                            >
                                {category.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                {category.isActive ? "Pausar" : "Activar"}
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowModal(category._id);
                                }}
                                className="flex items-center justify-center p-2.5 bg-brand-alert/5 text-brand-alert border border-brand-alert/10 hover:bg-brand-alert hover:text-white rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
                                title="Eliminar categoría"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCategories.length === 0 && (
                <div className="bg-white p-12 rounded-[2rem] border border-slate-100/60 text-center shadow-pop">
                    <p className="text-sm font-bold text-brand-dark/40 uppercase tracking-wide">No se encontraron categorías registradas.</p>
                </div>
            )}

            {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
            {showModal && (
                <div className="fixed inset-0 bg-brand-dark/20 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full border border-slate-100 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 bg-brand-alert/10 text-brand-alert rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-brand-alert/5">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight italic mb-2">¿Eliminar categoría?</h3>
                        <p className="text-xs text-brand-dark/40 font-semibold mb-6">Esta operación será rechazada automáticamente por el servidor si la categoría está en uso por mates, termos o combos en stock.</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => { handleDelete(showModal); setShowModal(null); }}
                                className="flex-1 bg-brand-alert text-white text-[11px] font-black uppercase tracking-widest py-3.5 rounded-xl shadow-md shadow-brand-alert/10 active:scale-95 transition-all cursor-pointer hover:bg-brand-alert/90"
                            >
                                Confirmar
                            </button>
                            <button
                                onClick={() => setShowModal(null)}
                                className="flex-1 bg-slate-100 text-brand-dark/60 text-[11px] font-black uppercase tracking-widest py-3.5 rounded-xl active:scale-95 transition-all cursor-pointer hover:bg-slate-200"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default CategoryList;