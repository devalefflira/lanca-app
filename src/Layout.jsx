import React, { useState } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Users,
  LogOut,
  Calculator,
  Menu,
  X,
  Building2,
  FileSpreadsheet,
  PieChart,
  Settings,
  Landmark,
  CreditCard,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- FUNÇÃO DE LOGOUT ---
  const handleLogout = async () => {
    await supabase.auth.signOut(); // Avisa o Supabase
    navigate("/login"); // Manda para a tela de login
  };

  const navItems = [
    {
      group: "Principal",
      items: [
        { href: "/dashboard", label: "Visão Geral", icon: LayoutDashboard },
        { href: "/contas", label: "Contas a Pagar", icon: FileText },
      ]
    },
    {
      group: "Relatórios",
      items: [
        { href: "/relatorios/diario", label: "Diário", icon: Calendar },
        { href: "/relatorios/semanal", label: "Semanal", icon: FileSpreadsheet },
        { href: "/relatorios/fornecedor", label: "Por Fornecedor", icon: Users },
      ]
    },
    {
      group: "Utilitários",
      items: [
        { href: "/utilitarios/calculadora", label: "Calculadora", icon: Calculator },
        { href: "/utilitarios/prazo", label: "Calc. Prazo", icon: Calendar },
        { href: "/utilitarios/contar-dias", label: "Contar Dias", icon: Calendar },
        { href: "/utilitarios/somar-dias", label: "Somar Dias", icon: Calendar },
      ]
    },
    {
      group: "Cadastros",
      items: [
        { href: "/fornecedores", label: "Fornecedores", icon: Users },
        { href: "/bancos", label: "Bancos", icon: Landmark },
        { href: "/tipos-documento", label: "Tipos Doc.", icon: FileText },
        { href: "/razoes", label: "Razões", icon: FileText },
        { href: "/parcelas", label: "Parcelas", icon: Calendar },
        { href: "/status", label: "Status", icon: Settings },
        { href: "/usuarios", label: "Usuários", icon: Users },
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-slate-300 fixed h-full z-10 shadow-xl transition-all duration-300">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/50">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Lança</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {navItems.map((group, idx) => (
            <div key={idx}>
              <h3 className="text-xs uppercase font-bold text-slate-500 mb-3 px-2 tracking-wider">{group.group}</h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                        isActive 
                          ? "bg-blue-600 text-white shadow-md shadow-blue-900/30 translate-x-1" 
                          : "hover:bg-slate-800 hover:text-white hover:translate-x-1"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-blue-100" : "text-slate-400 group-hover:text-white")} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 group-hover:text-red-400" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
         {/* Mobile Header */}
         <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-blue-500" />
              <span className="font-bold text-lg">Lança</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
         </div>

         {/* Mobile Menu Overlay */}
         {isMobileMenuOpen && (
           <div className="md:hidden fixed inset-0 z-30 bg-slate-900/95 backdrop-blur-sm p-4 pt-20 animate-in fade-in slide-in-from-top-10">
              <nav className="space-y-6">
                {navItems.map((group, idx) => (
                  <div key={idx}>
                    <h3 className="text-xs uppercase text-slate-500 font-bold mb-2">{group.group}</h3>
                    {group.items.map((item) => (
                      <Link 
                        key={item.href} 
                        to={item.href} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-3 text-slate-300 border-b border-slate-800 hover:text-white"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </div>
                      </Link>
                    ))}
                  </div>
                ))}
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left py-3 text-red-400 flex items-center gap-3 border-t border-slate-700 mt-4"
                >
                  <LogOut className="w-5 h-5" /> Sair
                </button>
              </nav>
           </div>
         )}

         <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
           <Outlet />
         </div>
      </main>

      <Toaster />
    </div>
  );
}