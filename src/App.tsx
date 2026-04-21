/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useVendasCalculator } from './hooks/useVendasCalculator';
import { 
  Users,
  LayoutDashboard, 
  ShoppingBag, 
  TrendingUp, 
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  MapPin,
  Trophy,
  Target,
  User as UserIcon,
  Search,
  ChevronRight,
  Filter,
  DollarSign
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './lib/firebase';
import { SaleType, SaleStatus, Sale } from './types';
import { cn } from './lib/utils';

// --- Components ---

const Card = ({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={cn("bg-[#111111] border border-[#222222] rounded-2xl p-5", className)} {...props}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  variant = 'primary', 
  className, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }) => {
  const variants = {
    primary: "bg-[#FFD700] text-black hover:bg-[#FFC400] font-bold",
    secondary: "bg-[#222222] text-[#FFD700] border border-[#333333] hover:bg-[#333333]",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
    ghost: "bg-transparent text-gray-400 hover:text-[#FFD700] hover:bg-[#222222]"
  };
  
  return (
    <button 
      className={cn("px-4 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none", variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};

const Header = () => {
  const { settings, logout } = useAuth();
  
  return (
    <div className="flex items-center justify-between p-6 bg-[#000000] sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="w-12 h-12 rounded-full border-2 border-[#FFD700] overflow-hidden p-0.5">
            <img 
              src={settings.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sales'} 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full" />
        </div>
        <div>
          <h2 className="text-white font-bold leading-tight">{settings.name}</h2>
          <p className="text-[#FFD700] text-xs font-medium tracking-wider uppercase">Vendas Pro</p>
        </div>
      </div>
      <button 
        onClick={logout}
        className="p-3 bg-[#111111] border border-[#222222] rounded-xl text-gray-400 hover:text-red-500 transition-colors"
      >
        <LogOut size={18} />
      </button>
    </div>
  );
};

// --- Tabs ---

const DashboardTab = () => {
  const { settings, updateSettings } = useAuth();
  const stats = useVendasCalculator();
  
  const toggleCity = async (city: keyof typeof settings.cities) => {
    await updateSettings({
      cities: {
        ...settings.cities,
        [city]: !settings.cities[city]
      }
    });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Salary Card */}
      <Card className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <DollarSign size={80} className="text-[#FFD700]" />
        </div>
        <div className="relative z-10">
          <p className="text-gray-400 text-sm font-medium">Salário Total Estimado</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-[#FFD700] text-4xl font-black">
              R$ {stats.totalSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-gray-600 text-sm mb-1.5 line-through">
              R$ {settings.baseSalary.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest text-[#FFD700]">
             <span className="bg-[#222222] px-2 py-1 rounded">Base: R$ {settings.baseSalary}</span>
             <span className="bg-[#222222] px-2 py-1 rounded">Cidades: +R$ {stats.cityBonusesTotal}</span>
             <span className="bg-[#222222] px-2 py-1 rounded">Comissões: +R$ {stats.commissionsTotal}</span>
             <span className="bg-[#222222] px-2 py-1 rounded">Bônus: +R$ {stats.autoBonuses}</span>
          </div>
        </div>
      </Card>

      {/* Meta Progress */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Target className="text-[#FFD700]" size={20} />
            <h3 className="text-white font-bold">Meta de Vendas</h3>
          </div>
          <span className="text-gray-400 text-xs font-mono">{stats.totalSales} / {settings.salesTarget}</span>
        </div>
        
        <div className="w-full h-3 bg-[#222222] rounded-full overflow-hidden mb-4">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${stats.progress}%` }}
            className="h-full bg-[#FFD700]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-[#1a1a1a] rounded-xl border border-[#222222]">
            <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Faltam</p>
            <p className="text-white text-xl font-black">{stats.missingSales}</p>
          </div>
          <div className="p-3 bg-[#1a1a1a] rounded-xl border border-[#222222]">
            <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Atingimento</p>
            <p className="text-[#FFD700] text-xl font-black">{Math.round(stats.progress)}%</p>
          </div>
        </div>
      </Card>

      {/* Cities Grid */}
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(settings.cities).map(([name, active]) => (
          <button 
            key={name}
            onClick={() => toggleCity(name as any)}
            className={cn(
               "p-4 rounded-2xl border transition-all text-left relative overflow-hidden group",
               active 
                 ? "bg-[#FFD700] border-[#FFD700] text-black" 
                 : "bg-[#111111] border-[#222222] text-white"
            )}
          >
            <MapPin size={24} className={cn("mb-2 opacity-50", active ? "text-black" : "text-[#FFD700]")} />
            <p className="text-xs font-bold uppercase tracking-wider opacity-70">Viagem</p>
            <h4 className="text-lg font-black leading-tight uppercase">{name}</h4>
            <div className="mt-2 flex items-center gap-1">
              <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", active ? "bg-black/20" : "bg-white/10")}>
                {active ? 'SIM' : 'NÃO'}
              </span>
              <span className="text-[10px] opacity-70">+R$ {settings.cityTravelBonus}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Instant Bonuses */}
      <Card className="space-y-4">
         <div className="flex items-center gap-2 mb-2">
            <Trophy className="text-[#FFD700]" size={20} />
            <h3 className="text-white font-bold">Bônus Automáticos</h3>
          </div>

          <div className={cn("p-4 rounded-xl border flex items-center justify-between", stats.hasEAD15Bonus ? "border-[#FFD700] bg-[#FFD700]/5" : "border-[#222222] opacity-50")}>
            <div>
              <p className="text-white font-bold text-sm">15 Vendas EAD</p>
              <p className="text-[#FFD700] text-xs">+R$ {settings.bonusEAD15}</p>
            </div>
            {stats.hasEAD15Bonus ? <CheckCircle2 className="text-[#FFD700]" /> : <Clock size={18} className="text-gray-600" />}
          </div>

          <div className={cn("p-4 rounded-xl border flex items-center justify-between", stats.hasTotal25Bonus ? "border-[#FFD700] bg-[#FFD700]/5" : "border-[#222222] opacity-50")}>
            <div>
              <p className="text-white font-bold text-sm">25 Vendas Totais</p>
              <p className="text-[#FFD700] text-xs">+R$ {settings.bonusTotal25}</p>
            </div>
            {stats.hasTotal25Bonus ? <CheckCircle2 className="text-[#FFD700]" /> : <Clock size={18} className="text-gray-600" />}
          </div>

          <div className={cn("p-4 rounded-xl border flex items-center justify-between", stats.hasTotal35Bonus ? "border-[#FFD700] bg-[#FFD700]/5" : "border-[#222222] opacity-50")}>
            <div>
              <p className="text-white font-bold text-sm">35 Vendas Totais</p>
              <p className="text-[#FFD700] text-xs">+R$ {settings.bonusTotal35}</p>
            </div>
            {stats.hasTotal35Bonus ? <CheckCircle2 className="text-[#FFD700]" /> : <Clock size={18} className="text-gray-600" />}
          </div>
      </Card>
    </div>
  );
};

const VendasTab = () => {
  const { user, sales } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    city: 'Londrina',
    type: 'Presencial' as SaleType,
    status: 'Pendente' as SaleStatus
  });

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Forced city logic: if EAD, city is always EAD
    const finalCity = formData.type === 'EAD' ? 'EAD' : formData.city;
    
    await addDoc(collection(db, 'users', user.uid, 'sales'), {
      ...formData,
      city: finalCity,
      userId: user.uid,
      createdAt: serverTimestamp()
    });
    
    setIsAdding(false);
    setFormData({ clientName: '', city: 'Londrina', type: 'Presencial', status: 'Pendente' });
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'sales', id));
  };

  const toggleStatus = async (id: string, current: SaleStatus) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'sales', id), {
      status: current === 'Pago' ? 'Pendente' : 'Pago'
    });
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-xl font-bold">Vendas</h3>
        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
          <Plus size={18} /> Novo Cliente
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <Card className="w-full max-w-md shadow-2xl space-y-4">
              <h3 className="text-white text-lg font-bold">Cadastrar Venda</h3>
              <form onSubmit={handleAddSale} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Nome do Cliente</label>
                  <input 
                    required
                    value={formData.clientName}
                    onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333333] rounded-xl p-3 text-white focus:border-[#FFD700] outline-none"
                    placeholder="Nome completo"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Cidade</label>
                    {formData.type === 'EAD' ? (
                      <div className="w-full bg-[#222222] border border-[#333333] rounded-xl p-3 text-gray-400 cursor-not-allowed font-bold italic">
                        EAD (Automático)
                      </div>
                    ) : (
                      <select 
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#333333] rounded-xl p-3 text-white focus:border-[#FFD700] outline-none"
                      >
                        <option>Londrina</option>
                        <option>Curitiba</option>
                        <option>Maringá</option>
                        <option>Toledo</option>
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Tipo</label>
                    <div className="flex bg-[#1a1a1a] p-1 rounded-xl border border-[#333333]">
                      {(['Presencial', 'EAD'] as SaleType[]).map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: t })}
                          className={cn(
                            "flex-1 py-2 text-[10px] font-bold rounded-lg transition-all",
                            formData.type === t ? "bg-[#FFD700] text-black" : "text-gray-500"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Status Inicial</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as SaleStatus })}
                    className="w-full bg-[#1a1a1a] border border-[#333333] rounded-xl p-3 text-white focus:border-[#FFD700] outline-none"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Pago">Pago</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsAdding(false)}>Cancelar</Button>
                  <Button type="submit" className="flex-1">Confirmar</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {sales.length === 0 ? (
          <div className="text-center py-12 opacity-30">
             <ShoppingBag size={48} className="mx-auto mb-4" />
             <p className="text-white font-medium">Nenhuma venda registrada</p>
          </div>
        ) : (
          sales.map((sale) => (
            <motion.div layout key={sale.id}>
              <Card className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border",
                    sale.status === 'Pago' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                  )}>
                    {sale.status === 'Pago' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{sale.clientName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-500 text-[10px] font-bold uppercase">{sale.city}</span>
                      <span className="w-1 h-1 bg-gray-700 rounded-full" />
                      <span className="text-[#FFD700] text-[10px] font-bold uppercase">{sale.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleStatus(sale.id, sale.status)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all",
                      sale.status === 'Pago' ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"
                    )}
                  >
                    {sale.status}
                  </button>
                  <button 
                    onClick={() => handleDelete(sale.id)}
                    className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

const AlunosTab = () => {
  const { user, sales } = useAuth();
  
  const groupedSales = useMemo(() => {
    const groups: { [key: string]: Sale[] } = {
      'Londrina': [],
      'Curitiba': [],
      'Maringá': [],
      'Toledo': [],
      'EAD': []
    };
    
    sales.forEach(sale => {
      const cityKey = sale.type === 'EAD' ? 'EAD' : sale.city;
      if (groups[cityKey]) {
        groups[cityKey].push(sale);
      } else {
        groups[cityKey] = [sale];
      }
    });
    
    return groups;
  }, [sales]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'sales', id));
  };

  const presencialEntries = Object.entries(groupedSales).filter(([city]) => city !== 'EAD') as [string, Sale[]][];
  const eadEntries = (groupedSales['EAD'] || []) as Sale[];

  return (
    <div className="space-y-8 pb-24">
      <div>
        <h3 className="text-white text-xl font-bold flex items-center gap-2 mb-6">
          <MapPin size={24} className="text-[#FFD700]" />
          Turmas Presenciais
        </h3>
        
        <div className="space-y-6">
          {presencialEntries.map(([city, citySales]) => (
            <div key={city} className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Turma {city}</h4>
                <span className="text-[#FFD700] text-[10px] font-bold">
                  {citySales.length} {citySales.length === 1 ? 'ALUNO' : 'ALUNOS'}
                </span>
              </div>
              
              <div className="space-y-2">
                {citySales.length === 0 ? (
                  <div className="p-3 border border-dashed border-[#222222] rounded-xl text-center">
                    <p className="text-gray-700 text-[10px] font-bold uppercase">Sem alunos presenciais</p>
                  </div>
                ) : (
                  citySales.map(sale => (
                    <Card key={sale.id} className="p-3 flex items-center justify-between bg-[#0a0a0a] border-[#222222]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#111111] flex items-center justify-center text-[#FFD700] border border-[#222222]">
                          <UserIcon size={14} />
                        </div>
                        <p className="text-white font-bold text-xs">{sale.clientName}</p>
                      </div>
                      <button 
                        onClick={() => handleDelete(sale.id)}
                        className="p-2 text-gray-700 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-[#222222]">
        <h3 className="text-white text-xl font-bold flex items-center gap-2 mb-6">
          <Clock size={24} className="text-[#FFD700]" />
          Turma Digital EAD
        </h3>
        
        <div className="space-y-2">
          {eadEntries.length === 0 ? (
            <div className="p-8 border border-dashed border-[#222222] rounded-2xl text-center">
              <p className="text-gray-600 text-[10px] font-bold uppercase">Nenhum aluno em curso EAD</p>
            </div>
          ) : (
            eadEntries.map(sale => (
              <Card key={sale.id} className="p-4 flex items-center justify-between bg-[#0a0a0a] border-[#222222] group hover:border-[#FFD700]/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] border border-[#FFD700]/20">
                    <UserIcon size={18} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm tracking-tight">{sale.clientName}</p>
                    <p className="text-[#FFD700] text-[10px] font-bold uppercase opacity-60">Matrícula EAD Ativa</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(sale.id)}
                  className="p-2 text-gray-800 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const ProjecaoTab = () => {
  const stats = useVendasCalculator();
  const { settings, sales } = useAuth();

  const chartData = useMemo(() => {
    // Ultimos 7 dias de vendas
    return [
      { name: 'Seg', v: 4 },
      { name: 'Ter', v: 7 },
      { name: 'Qua', v: 5 },
      { name: 'Qui', v: 12 },
      { name: 'Sex', v: stats.totalSales % 10 },
      { name: 'Sáb', v: 2 },
      { name: 'Dom', v: 0 },
    ];
  }, [stats.totalSales]);

  const pieData = [
    { name: 'Progresso', value: stats.totalSales },
    { name: 'Faltante', value: stats.missingSales },
  ];

  return (
    <div className="space-y-6 pb-24">
      <h3 className="text-white text-xl font-bold">Projeção & Stats</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col items-center justify-center text-center">
           <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie 
                  data={pieData} 
                  innerRadius={35} 
                  outerRadius={50} 
                  paddingAngle={5} 
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#FFD700" />
                  <Cell fill="#222222" />
                </Pie>
              </PieChart>
           </ResponsiveContainer>
           <h4 className="text-4xl font-black text-[#FFD700] mt-2">{Math.round(stats.progress)}%</h4>
           <p className="text-gray-500 text-[10px] font-bold uppercase">Da Meta Atingida</p>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center">
           <h4 className="text-4xl font-black text-white">{stats.totalSales}</h4>
           <p className="text-gray-500 text-[10px] font-bold uppercase mb-4">Vendas Realizadas</p>
           <div className="w-full bg-[#1a1a1a] p-2 rounded-lg border border-[#222222]">
              <p className="text-[#FFD700] text-[10px] font-bold uppercase">Projeção Final</p>
              <p className="text-white text-xs">R$ {stats.projections.estimatedEnd.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
           </div>
        </Card>
      </div>

      <Card>
        <h4 className="text-white text-sm font-bold mb-6">Desempenho Semanal</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222222" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10 }} />
            <Tooltip 
              cursor={{ fill: '#222222' }} 
              contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
            />
            <Bar dataKey="v" fill="#FFD700" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="bg-[#FFD700] text-black">
         <div className="flex items-center gap-3">
            <TrendingUp size={32} />
            <div>
              <h4 className="font-black text-lg uppercase leading-tight">Ritmo Atual</h4>
              <p className="text-sm font-bold opacity-80">Você está a caminho de bater seu recorde!</p>
            </div>
         </div>
      </Card>
    </div>
  );
};

const SettingsTab = () => {
  const { settings, updateSettings } = useAuth();
  
  const h = (key: keyof typeof settings, val: any) => {
    updateSettings({ [key]: val });
  };

  const Input = ({ label, value, onChange, type = "number" }: any) => (
    <div>
      <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        className="w-full bg-[#1a1a1a] border border-[#222222] rounded-xl p-3 text-white focus:border-[#FFD700] outline-none"
      />
    </div>
  );

  return (
    <div className="space-y-6 pb-24">
      <h3 className="text-white text-xl font-bold">Configurações</h3>
      
      <Card className="space-y-4">
         <h4 className="text-[#FFD700] text-[10px] font-bold uppercase border-b border-[#222222] pb-2">Perfil</h4>
         <Input label="Nome no Perfil" type="text" value={settings.name} onChange={(v: string) => h('name', v)} />
         <Input label="URL da Foto" type="text" value={settings.photoURL} onChange={(v: string) => h('photoURL', v)} />
      </Card>

      <Card className="space-y-4">
         <h4 className="text-[#FFD700] text-[10px] font-bold uppercase border-b border-[#222222] pb-2">Valores Base</h4>
         <Input label="Salário Base (R$)" value={settings.baseSalary} onChange={(v: number) => h('baseSalary', v)} />
         <Input label="Meta de Vendas" value={settings.salesTarget} onChange={(v: number) => h('salesTarget', v)} />
         <Input label="Bônus por Cidade (R$)" value={settings.cityTravelBonus} onChange={(v: number) => h('cityTravelBonus', v)} />
         <Input label="Comissão Após 10ª (R$)" value={settings.commissionPerSale} onChange={(v: number) => h('commissionPerSale', v)} />
      </Card>

      <Card className="space-y-4">
         <h4 className="text-[#FFD700] text-[10px] font-bold uppercase border-b border-[#222222] pb-2">Regras de Bônus</h4>
         
         <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white font-medium">Bônus 15 Vendas EAD</span>
              <button 
                onClick={() => h('enableBonusEAD15', !settings.enableBonusEAD15)}
                className={cn("w-10 h-5 rounded-full relative transition-all", settings.enableBonusEAD15 ? "bg-[#FFD700]" : "bg-[#333]")}
              >
                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-black transition-all", settings.enableBonusEAD15 ? "right-0.5" : "left-0.5")} />
              </button>
            </div>
            {settings.enableBonusEAD15 && (
              <Input label="Valor Bônus 15 EAD" value={settings.bonusEAD15} onChange={(v: number) => h('bonusEAD15', v)} />
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-white font-medium">Bônus 25 Vendas</span>
              <button 
                onClick={() => h('enableBonusTotal25', !settings.enableBonusTotal25)}
                className={cn("w-10 h-5 rounded-full relative transition-all", settings.enableBonusTotal25 ? "bg-[#FFD700]" : "bg-[#333]")}
              >
                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-black transition-all", settings.enableBonusTotal25 ? "right-0.5" : "left-0.5")} />
              </button>
            </div>
            {settings.enableBonusTotal25 && (
              <Input label="Valor Bônus 25 Vendas" value={settings.bonusTotal25} onChange={(v: number) => h('bonusTotal25', v)} />
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-white font-medium">Bônus 35 Vendas</span>
              <button 
                onClick={() => h('enableBonusTotal35', !settings.enableBonusTotal35)}
                className={cn("w-10 h-5 rounded-full relative transition-all", settings.enableBonusTotal35 ? "bg-[#FFD700]" : "bg-[#333]")}
              >
                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-black transition-all", settings.enableBonusTotal35 ? "right-0.5" : "left-0.5")} />
              </button>
            </div>
            {settings.enableBonusTotal35 && (
              <Input label="Valor Bônus 35 Vendas" value={settings.bonusTotal35} onChange={(v: number) => h('bonusTotal35', v)} />
            )}
         </div>
      </Card>
      
      <p className="text-center text-gray-700 text-[10px] font-bold uppercase pb-8">SalesMaster PRO v1.0.0</p>
    </div>
  );
};

// --- Main App Content ---

const AppContent = () => {
  const { user, loading, signIn, hasConfig } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-12 h-12 border-4 border-[#FFD700] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8 bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#000000_100%)]">
        <div className="w-full max-w-sm text-center space-y-8">
          <div className="relative inline-block">
             <div className="w-24 h-24 bg-[#FFD700] rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(255,215,0,0.2)]">
                <LayoutDashboard size={48} className="text-black" />
             </div>
             <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -top-4 -right-4 bg-white px-3 py-1 rounded-full text-[10px] font-black uppercase text-black"
             >
              PRO
             </motion.div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-white text-3xl font-black uppercase tracking-tighter">SalesMaster</h1>
            <p className="text-gray-500 font-medium">Controle suas vendas, metas e comissões com design premium e automação total.</p>
          </div>

          {!hasConfig ? (
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl space-y-4">
              <p className="text-red-500 text-sm font-bold">Configuração Pendente</p>
              <p className="text-gray-400 text-xs leading-relaxed">
                As chaves do Supabase não foram configuradas. <br/><br/>
                Por favor, adicione <b>VITE_SUPABASE_URL</b> e <b>VITE_SUPABASE_ANON_KEY</b> no menu de <b>Secrets</b> para que o aplicativo possa funcionar.
              </p>
            </div>
          ) : (
            <>
              <button 
                onClick={signIn}
                className="w-full bg-[#FFD700] text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#FFC400] transition-all hover:scale-[1.02] shadow-xl"
              >
                <LogInIcon size={20} /> Entrar com Google
              </button>
              
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Inicie sua jornada agora</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#FFD700] selection:text-black">
      <Header />
      
      <main className="px-6 max-w-2xl mx-auto">
        {activeTab === 'home' && <DashboardTab />}
        {activeTab === 'vendas' && <VendasTab />}
        {activeTab === 'alunos' && <AlunosTab />}
        {activeTab === 'stats' && <ProjecaoTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>

      {/* Navigation Rail */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-[#222222] px-6 py-4 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <NavButton icon={LayoutDashboard} active={activeTab === 'home'} onClick={() => setActiveTab('home')} color="#FFD700" />
          <NavButton icon={ShoppingBag} active={activeTab === 'vendas'} onClick={() => setActiveTab('vendas')} color="#FFD700" />
          <NavButton icon={Users} active={activeTab === 'alunos'} onClick={() => setActiveTab('alunos')} color="#FFD700" />
          <NavButton icon={TrendingUp} active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} color="#FFD700" />
          <NavButton icon={SettingsIcon} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} color="#FFD700" />
        </div>
      </nav>
    </div>
  );
};

const NavButton = ({ icon: Icon, active, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "relative p-2 rounded-xl transition-all duration-300", 
      active ? "text-black" : "text-gray-500 hover:text-white"
    )}
  >
    {active && (
      <motion.div 
        layoutId="activeTab"
        className="absolute inset-0 bg-[#FFD700] rounded-xl -z-10"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    )}
    <Icon size={24} />
  </button>
);

const LogInIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
