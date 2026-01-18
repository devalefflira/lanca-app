import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { parseISO } from 'date-fns';
import { Search, Loader2, Building2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { formatCurrency } from '@/components/shared/formatters';

export default function RelatorioFornecedor() {
  const [busca, setBusca] = useState('');

  const { data: contas = [], isLoading } = useQuery({
    queryKey: ['contas-relatorio-fornecedor'],
    queryFn: () => base44.entities.ContaPagar.list('nome_fornecedor', 1000),
  });

  // Group by supplier
  const fornecedoresAgrupados = React.useMemo(() => {
    const grouped = {};

    contas.forEach(conta => {
      const fornecedor = conta.nome_fornecedor || 'Sem Fornecedor';
      
      if (!grouped[fornecedor]) {
        grouped[fornecedor] = {
          nome: fornecedor,
          id_fornecedor: conta.id_fornecedor,
          contas: [],
          total: 0,
          pendente: 0,
          pago: 0
        };
      }

      grouped[fornecedor].contas.push(conta);
      grouped[fornecedor].total += conta.valor_original || 0;

      if (conta.status === 'Pago') {
        grouped[fornecedor].pago += conta.valor_original || 0;
      } else if (conta.status === 'Pendente') {
        grouped[fornecedor].pendente += conta.valor_original || 0;
      }
    });

    return Object.values(grouped)
      .sort((a, b) => b.total - a.total)
      .filter(f => 
        f.nome.toLowerCase().includes(busca.toLowerCase())
      );
  }, [contas, busca]);

  const totalGeral = fornecedoresAgrupados.reduce((sum, f) => sum + f.total, 0);
  const totalPendente = fornecedoresAgrupados.reduce((sum, f) => sum + f.pendente, 0);
  const totalPago = fornecedoresAgrupados.reduce((sum, f) => sum + f.pago, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Relatório por Fornecedor"
        subtitle="Visualize os totais agrupados por fornecedor"
      />

      {/* Filtro e Resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 border-0 shadow-lg bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar fornecedor..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        <Card className="p-4 border-0 shadow-lg bg-white">
          <p className="text-sm text-slate-500">Total Geral</p>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(totalGeral)}</p>
        </Card>

        <Card className="p-4 border-0 shadow-lg bg-white">
          <p className="text-sm text-slate-500">Total Pendente</p>
          <p className="text-xl font-bold text-amber-600">{formatCurrency(totalPendente)}</p>
        </Card>

        <Card className="p-4 border-0 shadow-lg bg-white">
          <p className="text-sm text-slate-500">Total Pago</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalPago)}</p>
        </Card>
      </div>

      {/* Lista de Fornecedores */}
      <div className="space-y-4">
        {fornecedoresAgrupados.length === 0 ? (
          <Card className="p-12 border-0 shadow-lg bg-white text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-400">Nenhum fornecedor encontrado</p>
          </Card>
        ) : (
          fornecedoresAgrupados.map((fornecedor, idx) => (
            <Card 
              key={fornecedor.nome} 
              className="p-5 border-0 shadow-lg bg-white hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">
                      {fornecedor.nome}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {fornecedor.contas.length} {fornecedor.contas.length === 1 ? 'conta' : 'contas'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  {fornecedor.pendente > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Pendente</p>
                      <p className="font-semibold text-amber-600">
                        {formatCurrency(fornecedor.pendente)}
                      </p>
                    </div>
                  )}
                  {fornecedor.pago > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Pago</p>
                      <p className="font-semibold text-emerald-600">
                        {formatCurrency(fornecedor.pago)}
                      </p>
                    </div>
                  )}
                  <div className="text-right min-w-[120px]">
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="font-bold text-xl text-slate-800">
                      {formatCurrency(fornecedor.total)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
                  style={{ width: `${(fornecedor.total / totalGeral) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-400 text-right">
                {((fornecedor.total / totalGeral) * 100).toFixed(1)}% do total
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}