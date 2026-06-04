import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import type { Product, Color, CartItem, ColorVariant } from "../../types";
import { 
  ShoppingCart, Store, Plus, Minus, 
  User, ClipboardX, CreditCard, CheckCircle, ShieldAlert 
} from "lucide-react";

interface CreateSaleProps {
    onSaleCreated: () => void;
    refreshTrigger: number;
}

const CreateSale = ({ onSaleCreated, refreshTrigger }: CreateSaleProps) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [comment, setComment] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get(`/products`);
                setProducts(res.data.data.filter((p: Product) => p.isActive));
            } catch (err) {
                console.error("Error obteniendo productos para POS:", err);
            }
        };
        fetchProducts();
    }, [refreshTrigger]);

    const reset = () => {
        setCart([]);
        setComment("");
        setCustomerName("");
    };

    const addToCart = (product: Product, variant: ColorVariant) => {
        const existing = cart.find(item => item.variantId === variant._id);
        
        if (existing) {
            if (existing.quantity >= variant.amount) {
                setErrorMessage("Sin stock suficiente en depósito");
                setTimeout(() => setErrorMessage(""), 2000);
                return;
            }
            setCart(cart.map(item => 
                item.variantId === variant._id 
                    ? { ...item, quantity: item.quantity + 1 } 
                    : item
            ));
        } else {
            setCart([...cart, {
                productId: product._id,
                variantId: variant._id!,
                name: `${product.name} (${(variant.color as Color)?.name})`,
                quantity: 1,
                price: variant.priceSell,
                maxStock: variant.amount
            }]);
        }
    };

    const handleConfirmSale = async () => {
        if (cart.length === 0) return;
        try {
            const saleData = {
                items: cart.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity
                })),
                customerName,
                comment
            };
            await api.post(`/sales`, saleData);
            setSuccessMessage("¡Venta registrada con éxito!");
            setTimeout(() => setSuccessMessage(""), 2000);
            reset();
            onSaleCreated();
        } catch (err) {
            console.error("Error realizando venta:", err);
            setErrorMessage("Error al procesar la venta en el servidor");
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    const removeFromCart = (variantId: string) => {
        const existing = cart.find(item => item.variantId === variantId);
        if (!existing) return;

        if (existing.quantity > 1) {
            setCart(cart.map(item =>
                item.variantId === variantId
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            ));
        } else {
            setCart(cart.filter(item => item.variantId !== variantId));
        }
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalItemsCount = cart.reduce((sum, i) => sum + i.quantity, 0);


    const inputStyle = "w-full bg-[#f4f6f9] text-[#1e293b] font-bold text-xs pl-11 pr-4 py-4 rounded-xl border border-transparent focus:bg-white focus:border-brand-primary/40 transition-all duration-200 outline-none placeholder:text-slate-400/80 shadow-inner";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto my-4">
            
            {/* SECCIÓN IZQUIERDA: CATÁLOGO DE PRODUCTOS*/}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                
                {/* ENCABEZADO DE SECCIÓN */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-pop border border-slate-100/60">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#f4f6f9] p-3.5 rounded-2xl text-brand-primary shadow-inner">
                            <Store className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-brand-dark uppercase tracking-tighter italic leading-none">Terminal de Caja</h2>
                            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] mt-1.5">Selección rápida de artículos en stock</p>
                        </div>
                    </div>
                    <span className="bg-slate-100 text-brand-dark/50 text-[10px] font-black px-3 py-1 rounded-full uppercase self-start sm:self-auto shadow-xs">
                        {products.length} Items disponibles
                    </span>
                </div>

                {/* NOTIFICACIONES FLOTANTES INTERNAS */}
                {errorMessage && (
                    <div className="p-4 bg-brand-alert/10 border border-brand-alert/20 rounded-xl text-brand-alert font-bold text-xs flex items-center gap-3 animate-in fade-in duration-200">
                        <ShieldAlert className="w-4 h-4 flex-shrink-0" /> {errorMessage}
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 bg-brand-accent/10 border border-brand-accent/20 rounded-xl text-brand-accent font-bold text-xs flex items-center gap-3 animate-in fade-in duration-200">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" /> {successMessage}
                    </div>
                )}

                {/* PRODUCTOS LISTADOS EN FILAS DE ACCESO RÁPIDO (Fast Tap List) */}
                <div className="space-y-4">
                    {products.map(product => (
                        <div 
                            key={product._id} 
                            className="bg-white p-5 md:p-6 rounded-[2rem] shadow-pop border border-slate-100/60 transition-all duration-200 hover:shadow-md"
                        >
                            <h3 className="text-sm font-black text-brand-dark uppercase tracking-wide mb-3 px-1 italic border-l-4 border-brand-primary pl-2.5">
                                {product.name}
                            </h3>
                            
                            {/* BOTONES DE SELECCIÓN DIRECTA */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {product.variants.map(v => {
                                    const outOfStock = v.amount <= 0;
                                    const isLowStock = v.amount > 0 && v.amount < 5;
                                    return (
                                        <button
                                            key={v._id}
                                            type="button"
                                            onClick={() => addToCart(product, v)}
                                            disabled={outOfStock}
                                            className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 text-left select-none cursor-pointer
                                                ${outOfStock 
                                                    ? "bg-slate-50 border-slate-100 opacity-40 pointer-events-none" 
                                                    : "bg-[#f4f6f9] border-transparent hover:bg-white hover:border-brand-primary/30 hover:scale-[1.02] hover:shadow-md active:scale-95"
                                                }`}
                                        >
                                            <div className="space-y-1 pr-2">
                                                <p className="text-xs font-bold text-brand-dark uppercase tracking-tight group-hover:text-brand-primary transition-colors">
                                                    {(v.color as Color)?.name || "Único"}
                                                </p>
                                                <span className={`text-[10px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-md ${isLowStock ? 'bg-brand-alert/10 text-brand-alert animate-pulse' : 'bg-brand-accent/10 text-brand-accent'}`}>
                                                    {v.amount} u.
                                                </span>
                                            </div>
                                            <span className="text-sm font-black text-brand-dark tracking-tight bg-white px-2 py-1 rounded-lg shadow-2xs group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                                ${v.priceSell.toLocaleString()}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SECCIÓN DERECHA: RESUMEN DE COMPRA */}
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-pop border border-slate-100/80 space-y-6">
                    
                    {/* ENCABEZADO DEL CARRITO */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                            <ShoppingCart className="w-5 h-5 text-brand-primary" />
                            <h2 className="text-base font-black text-brand-dark uppercase tracking-tight italic">Resumen de Venta</h2>
                        </div>
                        {cart.length > 0 && (
                            <button
                                type="button"
                                onClick={reset}
                                className="text-[10px] font-black text-brand-alert uppercase tracking-widest bg-brand-alert/5 hover:bg-brand-alert hover:text-white px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                            >
                                Vaciar
                            </button>
                        )}
                    </div>

                    {/* LISTADO DE ITEMS DENTRO DEL CARRITO  */}
                    <div className="max-h-[260px] overflow-y-auto pr-1 space-y-3 scrollbar-thin">
                        {cart.length === 0 ? (
                            <div className="py-10 text-center space-y-2 select-none">
                                <ShoppingCart className="w-8 h-8 text-slate-200 mx-auto" />
                                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Esperando productos...</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div 
                                    key={item.variantId} 
                                    className="flex items-center justify-between p-3.5 bg-[#f4f6f9] rounded-xl border border-transparent hover:border-slate-200/40 transition-colors"
                                >
                                    <div className="space-y-1 flex-1 pr-3">
                                        <p className="text-xs font-black text-brand-dark uppercase tracking-tight leading-tight">{item.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400">Precio unitario: ${item.price.toLocaleString()}</p>
                                    </div>

                                    {/* SELECTOR ADAPTATIVO INTERNO */}
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex items-center gap-1 bg-white p-1 rounded-lg shadow-2xs border border-slate-100">
                                            <button
                                                type="button"
                                                onClick={() => removeFromCart(item.variantId)}
                                                className="w-5 h-5 flex items-center justify-center bg-transparent rounded hover:bg-brand-alert/10 hover:text-brand-alert text-brand-dark font-black transition-colors cursor-pointer"
                                            >
                                                <Minus className="w-2.5 h-2.5" />
                                            </button>
                                            <span className="text-xs font-black text-brand-dark px-1.5">{item.quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const prod = products.find(p => p._id === item.productId);
                                                    const variant = prod?.variants.find(v => v._id === item.variantId);
                                                    if (variant) addToCart(prod!, variant);
                                                }}
                                                className="w-5 h-5 flex items-center justify-center bg-transparent rounded hover:bg-brand-dark hover:text-white text-brand-dark font-black transition-colors cursor-pointer"
                                            >
                                                <Plus className="w-2.5 h-2.5" />
                                            </button>
                                        </div>
                                        <span className="text-xs font-black text-brand-dark italic w-14 text-right">
                                            ${(item.price * item.quantity).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* SECTOR INFORMATIVO */}
                    <div className="bg-[#f4f6f9] p-5 rounded-2xl border border-transparent space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total a cobrar</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mt-0.5">{totalItemsCount} artículos listados</span>
                            </div>
                            <p className="text-2xl font-black text-brand-dark tracking-tighter italic">${total.toLocaleString()}</p>
                        </div>

                        {/* INPUT CLIENTE */}
                        <div className="relative flex items-center">
                            <User className="w-4 h-4 text-slate-400 absolute left-4" />
                            <input
                                type="text"
                                placeholder="Cliente..."
                                value={customerName}
                                onChange={e => setCustomerName(e.target.value.toUpperCase())}
                                className={inputStyle}
                            />
                        </div>

                        {/* INPUT COMENTARIO */}
                        <div className="relative flex items-start">
                            <ClipboardX className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                            <textarea
                                placeholder="Notas..."
                                rows={2}
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                className={`${inputStyle} pl-11 py-3.5 resize-none font-semibold h-16`}
                            />
                        </div>
                    </div>

                    {/* BOTONERA OPERATIVA DE CIERRE */}
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={handleConfirmSale}
                            disabled={cart.length === 0}
                            className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-lg shadow-brand-primary/20 transition-all duration-300 hover:scale-[1.01] hover:bg-[#765642] hover:shadow-xl active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                        >
                            <CreditCard className="w-4 h-4" /> Confirmar Venta
                        </button>

                        {cart.length > 0 && (
                            <button
                                type="button"
                                onClick={reset}
                                className="w-full text-[10px] font-black text-slate-400 hover:text-brand-alert uppercase tracking-widest py-2 transition-colors text-center cursor-pointer"
                            >
                                Cancelar operación
                            </button>
                        )}
                    </div>

                </div>
            </div>

        </div>
    );
};

export default CreateSale;