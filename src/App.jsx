import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './Layout';

// Auth
import Login from './pages/Login';
import PrivateRoute from './components/shared/PrivateRoute';

// Pages
import Dashboard from './pages/Dashboard';
import ContasPagar from './pages/ContasPagar';
import Fornecedores from './pages/Fornecedores';
import Bancos from './pages/Bancos';
import Razoes from './pages/Razoes';
import TiposDocumento from './pages/TiposDocumento';
import Parcelas from './pages/Parcelas';
import Status from './pages/Status';
import Usuarios from './pages/Usuarios';

// Relatórios
import RelatorioDiario from './pages/RelatorioDiario';
import RelatorioSemanal from './pages/RelatorioSemanal';
import RelatorioFornecedor from './pages/RelatorioFornecedor';

// Utilitários
import Calculadora from './pages/Calculadora';
import CalculadoraPrazo from './pages/CalculadoraPrazo';
import ContarDias from './pages/ContarDias';
import SomarDias from './pages/SomarDias';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Rota Pública (Login) */}
          <Route path="/login" element={<Login />} />

          {/* Rotas Protegidas (Exigem Login) */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Core */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="contas" element={<ContasPagar />} />
              
              {/* Cadastros */}
              <Route path="fornecedores" element={<Fornecedores />} />
              <Route path="bancos" element={<Bancos />} />
              <Route path="razoes" element={<Razoes />} />
              <Route path="tipos-documento" element={<TiposDocumento />} />
              <Route path="parcelas" element={<Parcelas />} />
              <Route path="status" element={<Status />} />
              <Route path="usuarios" element={<Usuarios />} />

              {/* Relatórios */}
              <Route path="relatorios/diario" element={<RelatorioDiario />} />
              <Route path="relatorios/semanal" element={<RelatorioSemanal />} />
              <Route path="relatorios/fornecedor" element={<RelatorioFornecedor />} />

              {/* Utilitários */}
              <Route path="utilitarios/calculadora" element={<Calculadora />} />
              <Route path="utilitarios/prazo" element={<CalculadoraPrazo />} />
              <Route path="utilitarios/contar-dias" element={<ContarDias />} />
              <Route path="utilitarios/somar-dias" element={<SomarDias />} />
            </Route>
          </Route>

          {/* Qualquer rota desconhecida vai para o dashboard (que vai jogar pro login se não tiver logado) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;