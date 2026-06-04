import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, Package, AlertTriangle, DollarSign, 
  ArrowRight, ShoppingCart, LayoutDashboard, Clock 
} from "lucide-react";
import type { Sale, Product } from "../../types";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    recentSales: [] as Sale[],
    totalRevenue: 0,
    totalProfit: 0,
    totalSalesCount: 0,
    lowStockCount: 0,
    totalProducts: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resSales, resProducts] = await Promise.all([
          api.get(`/sales`),
          api.get(`/products`)
        ]);

        const sales = resSales.data.data;
        const products = resProducts.data.data;

        const lowStock = products.filter((p: Product) => 
          p.isActive && p.variants.reduce((acc, v) => acc + v.amount, 0) <= 5
        ).length;

        setData({
          recentSales: sales.slice(0, 5),
          totalRevenue: resSales.data.totalRevenue || 0,
          totalProfit: resSales.data.totalProfit || 0,
          totalSalesCount: resSales.data.count || 0,
          lowStockCount: lowStock,
          totalProducts: products.length
        });
      } catch (err) {
        console.error("Error cargando dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
      <p className="text-brand-dark/40 font-black uppercase tracking-widest text-xs animate-pulse">Cargando...</p>
    </div>
  );

return (
        <div className="p-6 md:p-10 bg-[#f8fafc] min-h-screen animate-in fade-in duration-500">
          
          {/* HEADER */}
          <header className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 border-b border-slate-200/60 pb-6">
            <div className="flex items-center gap-5">
              <div className="bg-brand-primary p-3.5 rounded-2xl shadow-lg shadow-brand-primary/20">
                <LayoutDashboard className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-brand-dark tracking-tighter uppercase italic leading-none">Panel de Control</h1>
                <p className="text-brand-dark/30 font-bold text-[10px] uppercase tracking-[0.25em] mt-2">Métricas de Rendimiento</p>
              </div>
            </div>
            <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-100/80 flex items-center gap-3 self-start sm:self-auto">
              <Clock className="w-4 h-4 text-brand-primary" />
              <span className="text-[10px] font-black text-brand-dark/50 uppercase tracking-widest">
                Última actualización: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          </header>

          {/* KPI CARDS */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Ventas */}
            <div className="bg-white p-8 rounded-[var(--radius-kpi)] shadow-pop border border-slate-100/50 flex flex-col justify-between min-h-[160px] transition-all duration-300 hover:-translate-y-1 hover:shadow-pop-hover">
              <div className="bg-brand-primary/10 w-11 h-11 rounded-xl flex items-center justify-center text-brand-primary">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[10px] font-black text-brand-dark/40 uppercase tracking-widest mb-1">Ventas Totales</h3>
                <p className="text-3xl font-black text-brand-dark tracking-tighter italic">${data.totalRevenue.toLocaleString()}</p>
              </div>
            </div>

            {/* Ganancias */}
            <div className="bg-white p-8 rounded-[var(--radius-kpi)] shadow-pop border border-slate-100/50 flex flex-col justify-between min-h-[160px] transition-all duration-300 hover:-translate-y-1 hover:shadow-pop-hover">
              <div className="bg-brand-accent/10 w-11 h-11 rounded-xl flex items-center justify-center text-brand-accent">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[10px] font-black text-brand-dark/40 uppercase tracking-widest mb-1">Ganancia Est.</h3>
                <p className="text-3xl font-black text-brand-accent tracking-tighter italic">${data.totalProfit.toLocaleString()}</p>
              </div>
            </div>

            {/* Productos */}
            <div className="bg-white p-8 rounded-[var(--radius-kpi)] shadow-pop border border-slate-100/50 flex flex-col justify-between min-h-[160px] transition-all duration-300 hover:-translate-y-1 hover:shadow-pop-hover">
              <div className="bg-slate-100 w-11 h-11 rounded-xl flex items-center justify-center text-brand-dark/60">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[10px] font-black text-brand-dark/40 uppercase tracking-widest mb-1">Productos</h3>
                <p className="text-3xl font-black text-brand-dark tracking-tighter italic">{data.totalProducts}</p>
              </div>
            </div>

            {/* Stock Crítico */}
            <div className={`p-8 rounded-[var(--radius-kpi)] shadow-pop border transition-all duration-300 flex flex-col justify-between min-h-[160px] hover:-translate-y-1 ${data.lowStockCount > 0 ? 'bg-brand-alert/[0.02] border-brand-alert/20 hover:shadow-xl hover:shadow-brand-alert/5' : 'bg-white border-slate-100/50 hover:shadow-pop-hover'}`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${data.lowStockCount > 0 ? 'bg-brand-alert text-white shadow-md shadow-brand-alert/20' : 'bg-slate-100 text-brand-dark/30'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[10px] font-black text-brand-dark/40 uppercase tracking-widest mb-1">Stock Crítico</h3>
                <p className={`text-3xl font-black tracking-tighter italic ${data.lowStockCount > 0 ? 'text-brand-alert' : 'text-brand-dark'}`}>{data.lowStockCount} Items</p>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* TABLA DE RECIENTES */}
            <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] shadow-pop border border-slate-100/40">
              <div className="flex items-center justify-between mb-8 px-2">
                <h3 className="text-xl font-black text-brand-dark tracking-tighter uppercase italic flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-brand-primary" /> Recientes
                </h3>
                <button 
                  onClick={() => navigate('/sales')} 
                  className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] hover:opacity-70 transition-all flex items-center gap-1 cursor-pointer group"
                >
                  Ver Historial <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
              <div className="space-y-3">
                {data.recentSales.map(sale => (
                  <div key={sale._id} className="flex items-center justify-between p-5 bg-slate-50/60 rounded-[var(--radius-inner)] hover:bg-white hover:shadow-md transition-all duration-200 border border-transparent hover:border-slate-100/80 group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm text-[10px] font-black text-brand-dark/40 uppercase italic">
                        {new Date(sale.createdAt).toLocaleDateString('es-AR', {day: '2-digit', month: '2-digit'})}
                      </div>
                      <div>
                        <p className="text-xs font-black text-brand-dark uppercase tracking-tight">Venta #{sale._id.slice(-4)}</p>
                        <p className="text-[9px] text-brand-dark/40 font-bold uppercase">{sale.items.length} productos registrados</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-brand-accent italic text-lg">${sale.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BOTONES DE ACCESO RÁPIDO */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div 
                onClick={() => navigate('/sales')}
                className="group relative bg-brand-primary p-10 rounded-[var(--radius-action)] shadow-lg shadow-brand-primary/20 text-white overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-primary/30 active:scale-[0.97]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                <h3 className="text-3xl font-black tracking-tighter uppercase italic mb-1">Nueva Venta</h3>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.25em]">Terminal de cobro</p>
                <ShoppingCart className="absolute -bottom-5 -right-5 w-24 h-24 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-300 rotate-12" />
              </div>

              <div 
                onClick={() => navigate('/products')}
                className="group bg-brand-dark p-10 rounded-[var(--radius-action)] shadow-lg shadow-brand-dark/10 text-white overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-dark/20 active:scale-[0.97] border border-brand-dark"
              >
                <h3 className="text-3xl font-black tracking-tighter uppercase italic mb-1">Inventario</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em]">Carga y Stock</p>
                <div className="mt-8 flex items-center justify-between">
                  <Package className="text-brand-primary w-8 h-8 group-hover:rotate-6 transition-transform" />
                  <ArrowRight className="w-5 h-5 text-slate-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </div>
            </div>

          </div>
        </div>
    );
};

export default Dashboard;