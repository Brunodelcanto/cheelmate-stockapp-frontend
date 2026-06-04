import { useEffect, useState } from "react";
import type { Sale } from "../../types";
import api from "../../api/axiosConfig";
import { 
  TrendingUp, DollarSign, ShoppingBag, Search, Calendar, 
  Eye, FileText, X, Receipt, Layers
} from "lucide-react";

interface SalesListProps {
    refreshTrigger: number;
}

const SalesList = ({ refreshTrigger }: SalesListProps) => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [totals, setTotals] = useState({ count: 0, revenue: 0, profit: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

    const fetchSales = async () => {
        try {
            setLoading(true);
            let endpoint = `/sales?t=${Date.now()}`;
            if (startDate && endDate) {
                endpoint += `&startDate=${startDate}&endDate=${endDate}`;
            }
            const res = await api.get(endpoint);

            setSales(res.data.data);
            setTotals({ 
                count: res.data.count || 0, 
                revenue: res.data.totalRevenue || 0, 
                profit: res.data.totalProfit || 0 
            });
        } catch (err) {
            console.error("Error al traer ventas:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, [refreshTrigger, startDate, endDate]);
    
    const filteredSales = sales.filter((sale) => {
        const term = searchTerm.toLowerCase();
        const matchesComment = sale.comment?.toLowerCase().includes(term);
        const matchesCustomer = sale.customerName.toLowerCase().includes(term);
        const matchesProduct = sale.items.some((item) =>
            item.name.toLowerCase().includes(term)
        );
        return matchesComment || matchesCustomer || matchesProduct;
    });

    if (loading) return (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 bg-transparent">
            <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
            <p className="text-brand-dark/40 font-black uppercase tracking-widest text-xs animate-pulse">Cargando...</p>
        </div>
    );

    const inputStyle = "w-full bg-[#f4f6f9] text-[#1e293b] font-bold text-xs pl-11 pr-4 py-3.5 rounded-xl border border-transparent focus:bg-white focus:border-brand-primary/40 outline-none transition-all shadow-inner";
    const labelStyle = "text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1";

    return (
        <div className="space-y-8 max-w-7xl mx-auto my-2 animate-in fade-in duration-300">

            {/* HEADER */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Card ventas */}
                <div className="bg-white p-6 rounded-[2rem] shadow-pop border border-slate-100/60 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-pop-hover">
                    <div>
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Ventas</h2>
                        <p className="text-3xl font-black text-brand-dark tracking-tighter italic">{totals.count}</p>
                    </div>
                    <div className="bg-brand-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center text-brand-primary shadow-inner">
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                </div>

                {/* Card Ingresos */}
                <div className="bg-white p-6 rounded-[2rem] shadow-pop border border-slate-100/60 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-pop-hover">
                    <div>
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ingresos Totales</h2>
                        <p className="text-3xl font-black text-brand-dark tracking-tighter italic">${totals.revenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-brand-accent/10 w-12 h-12 rounded-2xl flex items-center justify-center text-brand-accent shadow-inner">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                </div>

                {/* Card Ganancia */}
                <div className="bg-white p-6 rounded-[2rem] shadow-pop border border-slate-100/60 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-pop-hover">
                    <div>
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ganancia Estimada</h2>
                        <p className="text-3xl font-black text-brand-accent tracking-tighter italic">${totals.profit.toLocaleString()}</p>
                    </div>
                    <div className="bg-amber-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-brand-accent shadow-inner">
                        <DollarSign className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* PANEL DE FILTROS Y BÚSQUEDA  */}
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-pop border border-slate-100/60 space-y-4">
                <div className="flex items-center gap-2 px-1 mb-2">
                    <Layers className="w-4 h-4 text-brand-primary" />
                    <h3 className="text-base font-black text-brand-dark uppercase tracking-tight italic">Panel de Busqueda y Filtros</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Búsqueda Rápida */}
                    <div className="md:col-span-6 relative flex flex-col justify-end">
                        <label className={labelStyle}>Búsqueda rápida</label>
                        <div className="relative flex items-center">
                            <Search className="w-4 h-4 text-slate-400 absolute left-4" />
                            <input 
                                type="text" 
                                placeholder="Buscar por cliente, nota, producto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Fecha Inicial */}
                    <div className="md:col-span-3 relative flex flex-col justify-end">
                        <label className={labelStyle}>Fecha inicial</label>
                        <div className="relative flex items-center">
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-4" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className={`${inputStyle} uppercase tracking-wider`}
                            />
                        </div>
                    </div>
                    
                    {/* Fecha Final */}
                    <div className="md:col-span-3 relative flex flex-col justify-end">
                        <label className={labelStyle}>Fecha final</label>
                        <div className="relative flex items-center">
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-4" />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className={`${inputStyle} uppercase tracking-wider`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* TABLA DE VENTAS  */}
            <div className="bg-brand-secondary p-6 md:p-8 rounded-[3rem] border border-stone-100/60 shadow-premium overflow-hidden">
                <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-xs">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">
                                <th className="p-5">Fecha y hora</th>
                                <th className="p-5">Comprador</th>
                                <th className="p-5">Artículos detallados</th>
                                <th className="p-5">Notas de caja</th>
                                <th className="p-5 text-right">Monto cobrado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-brand-dark font-medium">
                            {filteredSales.map((sale) => (
                                <tr key={sale._id} className="hover:bg-slate-50/60 transition-colors duration-150 group">
                                    <td className="p-5 whitespace-nowrap font-semibold text-slate-500">
                                        {new Date(sale.createdAt).toLocaleString('es-AR', {day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit'})}
                                    </td>
                                    <td className="p-5 font-black uppercase tracking-tight text-brand-dark">
                                        {sale.customerName || "Consumidor Final"}
                                    </td>
                                    <td className="p-5 max-w-[320px]">
                                        <div className="space-y-2">
                                            {sale.items.map((item, idx) => (
                                                <div key={idx} className="bg-[#f4f6f9] p-2.5 rounded-xl border border-slate-100/30">
                                                    <div className="flex items-center justify-between font-black text-[11px] text-brand-dark uppercase">
                                                        <span>{item.name}</span>
                                                        <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded-md text-brand-primary">x{item.quantity}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mt-1">
                                                        <span>Unit: ${item.priceAtSale.toLocaleString()}</span>
                                                        <span className="font-black text-brand-dark/70">Sub: ${(item.priceAtSale * item.quantity).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        {sale.comment ? (
                                            <div className="flex flex-col items-start gap-2">
                                                <p className="text-slate-400 font-semibold italic max-w-[180px] truncate">
                                                    "{sale.comment}"
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedSale(sale)}
                                                    className="flex items-center gap-1 text-[9px] font-black text-brand-primary uppercase tracking-widest hover:opacity-80 cursor-pointer"
                                                >
                                                    <Eye className="w-3 h-3" /> Ver ticket
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-slate-300 font-bold uppercase text-[10px] tracking-wider">— Sin Notas —</span>
                                        )}
                                    </td>
                                    <td className="p-5 text-lg font-black text-brand-accent/90 tracking-tighter italic group-hover:text-brand-primary transition-colors">
                                        ${sale.totalAmount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredSales.length === 0 && (
                    <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center shadow-xs">
                        <Receipt className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">No se registraron ventas en el bloque consultado.</p>
                    </div>
                )}
            </div>

            {/* MODAL DETALLE DE TICKET */}
            {selectedSale && (
                <div className="fixed inset-0 bg-brand-dark/20 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full border border-slate-100 relative animate-in zoom-in-95 duration-200">
                        
                        {/* Botón superior de cierre */}
                        <button
                            type="button"
                            onClick={() => setSelectedSale(null)}
                            className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-xl active:scale-90 transition-transform cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Encabezado del Ticket */}
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-5 mb-6">
                            <div className="bg-brand-primary/10 p-3.5 rounded-2xl text-brand-primary shadow-inner">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-brand-dark uppercase tracking-tight italic">Comprobante de Caja</h3>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-0.5">
                                    {new Date(selectedSale.createdAt).toLocaleString('es-AR')}
                                </p>
                            </div>
                        </div>

                        {/* Contenido del Ticket */}
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-0.5">Cliente</h4>
                                <p className="text-xs font-black uppercase tracking-tight text-brand-dark bg-[#f4f6f9] px-4 py-2.5 rounded-xl border border-transparent shadow-inner">
                                    {selectedSale.customerName || "CONUMIDOR FINAL"}
                                </p>
                            </div>

                            {selectedSale.comment && (
                                <div>
                                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-0.5">Nota</h4>
                                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-slate-500 font-semibold italic text-xs leading-relaxed">
                                        "{selectedSale.comment}"
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-0.5">Artículos vendidos</h4>
                                <div className="space-y-2 bg-[#f4f6f9] p-4 rounded-2xl border border-transparent shadow-inner max-h-[140px] overflow-y-auto">
                                    {selectedSale.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-white last:border-0">
                                            <span className="font-bold text-brand-dark uppercase tracking-tight flex items-center gap-1.5">
                                                {item.name} <span className="text-brand-primary font-black">x{item.quantity}</span>
                                            </span>
                                            <span className="font-black text-brand-dark">${(item.priceAtSale * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Fila Final */}
                            <div className="flex items-center justify-between bg-brand-primary p-5 rounded-2xl text-white shadow-lg shadow-brand-dark/15">
                                <div>
                                    <span className="text-[9px] font-black text-white/50 uppercase tracking-widest block">Total Cobrado</span>
                                    <span className="text-[8px] font-bold text-white/40 uppercase block mt-0.5">Operación de cobro exitosa</span>
                                </div>
                                <span className="text-2xl font-black italic tracking-tighter text-white">
                                    ${selectedSale.totalAmount.toLocaleString()}
                                </span>
                            </div>

                            {/* Botón de cierre */}
                            <button
                                type="button"
                                onClick={() => setSelectedSale(null)}
                                className="w-full bg-slate-100 text-brand-dark/60 font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-all duration-200 hover:bg-slate-200 active:scale-[0.98] cursor-pointer text-center"
                            >
                                Cerrar detalle
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesList;