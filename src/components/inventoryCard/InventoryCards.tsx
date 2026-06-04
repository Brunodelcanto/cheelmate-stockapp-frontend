import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import type { Category, Product } from "../../types";
import { useNavigate } from "react-router-dom";
import { 
  Search, Package, Play, Pause, 
  Trash2, Layers, Plus, Minus, ShieldAlert 
} from "lucide-react";

interface InventoryCardsProps {
    refreshTrigger: number;
}

const InventoryCards = ({ refreshTrigger }: InventoryCardsProps) => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState<string | null>(null);

    const fetchProducts = async () => {
        try {
            const response = await api.get(`/products`);
            setProducts(response.data.data);
        } catch (err) {
            console.error("Error fetching products:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [refreshTrigger]);

    const filteredProducts = products.filter(product => {
        const term = searchTerm.toLowerCase();
        const categoryName = typeof product.category === 'object' && product.category !== null
            ? (product.category as Category).name.toLowerCase()
            : '';
        const productName = product.name.toLowerCase();
        return productName.includes(term) || categoryName.includes(term);
    });

    const groupedProducts = filteredProducts.reduce((acc: Record<string, Product[]>, product) => {
        const categoryName = 
            typeof product.category === 'object' && product.category !== null
                ? (product.category as Category).name 
                : 'Sin Categoría';
        
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(product);
        return acc;
    }, {});

    const handleQuantityChange = async (productId: string, color: string, quantity: number) => {
        try {
            const response = await api.patch(`/products/update-stock/${productId}`, {
                color,
                quantity
            });
            if (!response.data.error) {
                setProducts(prev => prev.map(p => p._id === productId ? response.data.data : p));
            }
        } catch (err) {
            console.error("Error actualizando stock:", err);
        }
    };

    const handleToggleActive = async (productId: string, isActive: boolean) => {
        try {
            const endpoint = isActive ? "deactivate" : "activate";
            const response = await api.patch(`/products/${endpoint}/${productId}`);
            if (!response.data.error) {
                setProducts(prev => prev.map(p =>
                    p._id === productId ? { ...p, isActive: !isActive } : p
                ));
            }
        } catch (err) {
            console.error("Error al cambiar el estado del producto:", err);
        }
    };

    const eliminateProduct = async (productId: string) => {
        try {
            const response = await api.delete(`/products/${productId}`);
            if (!response.data.error) {
                setProducts(prev => prev.filter(p => p._id !== productId));
            }
        } catch (err) {
            console.error("Error al eliminar el producto:", err);
        }
    };

    if (loading) return (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 bg-transparent">
            <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
            <p className="text-brand-dark/40 font-black uppercase tracking-widest text-xs animate-pulse">Cargando...</p>
        </div>
    );

return (
        <div className="space-y-12">
            
            {/* BUSCADOR */}
            <div className="bg-white p-6 rounded-[2rem] shadow-pop border border-slate-100/60 max-w-md">
                <label className="text-[10px] font-black text-brand-dark/40 uppercase tracking-widest block mb-2.5 px-1">Buscador</label>
                <div className="relative flex items-center">
                    <Search className="w-5 h-5 text-brand-dark/30 absolute left-5" />
                    <input 
                        type="text" 
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#f8fafc] text-brand-dark font-semibold text-sm pl-14 pr-5 py-4 rounded-xl border border-transparent focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200 outline-none placeholder:text-brand-dark/30 shadow-inner"
                    />
                </div>
            </div>

            {/* CONTENEDOR DE CATEGORÍAS */}
            <div className="space-y-14">
                {Object.keys(groupedProducts).map((categoryName) => (
                    <div key={categoryName} className="space-y-6">
                        
                        {/* HEADER DE CATEGORIA */}
                        <div className="flex items-center gap-3 border-b border-slate-200/60 pb-3 px-2">
                            <Layers className="w-4 h-4 text-brand-primary" />
                            <h2 className="text-xl font-black text-brand-dark uppercase tracking-tighter italic leading-none">{categoryName}</h2>
                            <span className="bg-slate-100 text-brand-dark/50 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">{groupedProducts[categoryName].length} Items</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {groupedProducts[categoryName].map((product) => {
                                const totalStock = product.variants.reduce((sum, v) => sum + v.amount, 0);
                                const outOfStock = totalStock === 0;
                                const lowStock = totalStock > 0 && totalStock <= 5;

                                return (
                                    <div
                                        key={product._id}
                                        onClick={() => navigate(`/edit-product/${product._id}`)}
                                        className={`group/card relative bg-white rounded-[2.2rem] shadow-pop border border-slate-100/80 p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-pop-hover cursor-pointer overflow-hidden ${!product.isActive ? "opacity-75 bg-slate-50/50" : ""}`}
                                    >
                                        
                                        <div className="absolute top-4 right-4 z-10 flex gap-2">
                                            {outOfStock && (
                                                <span className="bg-brand-alert text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md shadow-brand-alert/10 animate-pulse">
                                                    Agotado
                                                </span>
                                            )}
                                            {lowStock && !outOfStock && (
                                                <span className="bg-brand-primary text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md shadow-brand-primary/10">
                                                    Reponer
                                                </span>
                                            )}
                                            {!product.isActive && (
                                                <span className="bg-slate-700 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                                                    Pausado
                                                </span>
                                            )}
                                        </div>

                                        {/* IMAGEN E INFO PRINCIPAL */}
                                        <div className="flex flex-col sm:flex-row items-center gap-5 mb-6">
                                            <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200/40 flex-shrink-0 flex items-center justify-center">
                                                {product.image?.url ? (
                                                    <img src={product.image.url} alt={product.name} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300" />
                                                ) : (
                                                    <Package className="w-8 h-8 text-brand-dark/20" />
                                                )}
                                            </div>
                                            <div className="text-center sm:text-left flex-1">
                                                <h3 className="text-lg font-black text-brand-dark uppercase tracking-tight italic group-hover/card:text-brand-primary transition-colors mb-1">
                                                    {product.name}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* GRID DE VARIANTES */}
                                        <div className="space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 mb-6">
                                            {product.variants.map((v, idx) => {
                                                const colorName = typeof v.color === 'object' && v.color !== null ? v.color.name : 'Color...';
                                                const colorId = typeof v.color === 'object' && v.color !== null ? v.color._id : v.color;

                                                return (
                                                    <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-slate-200/40 last:border-0">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-bold text-brand-dark/70 uppercase tracking-wide">{colorName}</span>
                                                            <span className="font-black text-brand-dark/40 bg-white border border-slate-100 px-2 py-0.5 rounded-md">${v.priceSell.toLocaleString()}</span>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <span className={`font-black text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-md ${v.amount < 3 ? "bg-brand-alert/10 text-brand-alert animate-pulse" : "bg-brand-accent/10 text-brand-accent"}`}>
                                                                {v.amount} u.
                                                            </span>
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleQuantityChange(product._id, colorId, -1); }}
                                                                    disabled={v.amount <= 0 || !product.isActive}
                                                                    className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-brand-dark font-black hover:bg-brand-alert hover:text-white hover:border-transparent active:scale-90 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-sm"
                                                                >
                                                                    <Minus className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleQuantityChange(product._id, colorId, 1); }}
                                                                    disabled={!product.isActive}
                                                                    className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-brand-dark font-black hover:bg-brand-dark hover:text-white hover:border-transparent active:scale-90 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-sm"
                                                                >
                                                                    <Plus className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* FOOTER DE CARD */}
                                        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${product.isActive ? "bg-brand-active" : "bg-slate-400"}`} />
                                                <span className="text-[10px] font-black text-brand-dark/40 uppercase tracking-widest">{product.isActive ? 'Activo' : 'Pausado'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleActive(product._id, product.isActive); }}
                                                    className={`flex items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all duration-200 active:scale-95 cursor-pointer ${product.isActive ? "bg-slate-50 text-brand-dark/70 border-slate-200 hover:bg-brand-dark hover:text-white hover:border-transparent" : "bg-brand-accent/10 text-brand-accent border-brand-accent/10 hover:bg-brand-accent hover:text-white"}`}
                                                >
                                                    {product.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                                    {product.isActive ? "Pausar" : "Activar"}
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setShowModal(product._id); }}
                                                    className="flex items-center gap-1 px-3 py-2 bg-brand-alert/5 text-brand-alert border border-brand-alert/10 hover:bg-brand-alert hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer"
                                                >
                                                    <Trash2 className="w-3 h-3" /> Eliminar
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>

                    </div>
                ))}
            </div>

            {/* MODAL DE ELIMINACION BLUR FLOTANTE */}
            {showModal && (
                <div className="fixed inset-0 bg-brand-dark/20 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full border border-slate-100 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 bg-brand-alert/10 text-brand-alert rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-brand-alert/5">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight italic mb-2">¿Eliminar producto?</h3>
                        <p className="text-xs text-brand-dark/40 font-semibold mb-6">Esta acción descontará el artículo permanentemente del stock y no se puede deshacer.</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => { eliminateProduct(showModal); setShowModal(null); }}
                                className="flex-1 bg-brand-alert text-white text-[11px] font-black uppercase tracking-widest py-3.5 rounded-xl shadow-md shadow-brand-alert/10 active:scale-95 transition-all cursor-pointer hover:bg-brand-alert/90"
                            >
                                Sí, eliminar
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
        </div>
    );
};

export default InventoryCards;