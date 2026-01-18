import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import {
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  Building2,
  Loader2
} from 'lucide-react';
import StatsCard from '@/components/shared/StatsCard';
import { formatCurrency } from '@/components/shared/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function Dashboard() {
  const { data: contas = [], isLoading } = useQuery({
    queryKey: ['contas-dashboard'],
    queryFn: () => base44.entities.ContaPagar.list('-created_date', 1000),
  });

  const { data: tiposDocumento = [] } = useQuery({
    queryKey: ['tipos-documento'],
    queryFn: () => base44.entities.TipoDocumento.list(),
  });

  // KPIs
  const totalDocumentos = contas.length;
  const valorTotal = contas.reduce((sum, c) => sum + (c.valor_original || 0), 0);
  const valorPendente = contas
    .filter(c => c.status === 'Pendente')
    .reduce((sum, c) => sum + (c.valor_original || 0), 0);
  const valorPago = contas
    .filter(c => c.status === 'Pago')
    .reduce((sum, c) => sum + (c.valor_original || 0), 0);

  // Documentos por tipo
  const docsPorTipo = tiposDocumento.map(tipo => {
    const docs = contas.filter(c => c.tipo_documento === tipo.descricao);
    return {
      name: tipo.descricao,
      quantidade: docs.length,
      valor: docs.reduce((sum, c) => sum + (c.valor_original || 0), 0)
    };
  }).filter(t => t.quantidade > 0);

  // Valor por tipo para pizza
  const valorPorTipo = docsPorTipo.map(t => ({
    name: t.name,
    value: t.valor
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Visão geral das contas a pagar</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total de Documentos"
          value={totalDocumentos}
          icon={FileText}
          iconClassName="bg-blue-500"
        />
        <StatsCard
          title="Valor Total"
          value={formatCurrency(valorTotal)}
          icon={DollarSign}
          iconClassName="bg-emerald-500"
        />
        <StatsCard
          title="Valor Pendente"
          value={formatCurrency(valorPendente)}
          icon={Clock}
          iconClassName="bg-amber-500"
        />
        <StatsCard
          title="Valor Pago"
          value={formatCurrency(valorPago)}
          icon={CheckCircle}
          iconClassName="bg-green-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documentos por Tipo */}
        <Card className="p-6 border-0 shadow-lg shadow-slate-200/50">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Quantidade por Tipo de Documento
          </h3>
          {docsPorTipo.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={docsPorTipo}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="quantidade" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
              Nenhum dado disponível
            </div>
          )}
        </Card>

        {/* Valor por Tipo */}
        <Card className="p-6 border-0 shadow-lg shadow-slate-200/50">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Valor por Tipo de Documento
          </h3>
          {valorPorTipo.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={valorPorTipo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {valorPorTipo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
              Nenhum dado disponível
            </div>
          )}
        </Card>
      </div>

      {/* Lista de Valores por Tipo */}
      <Card className="p-6 border-0 shadow-lg shadow-slate-200/50">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Resumo por Tipo de Documento
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Tipo</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-600">Quantidade</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-600">Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {docsPorTipo.map((tipo, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      {tipo.name}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">{tipo.quantidade}</td>
                  <td className="py-3 px-4 text-right font-medium text-emerald-600">
                    {formatCurrency(tipo.valor)}
                  </td>
                </tr>
              ))}
              {docsPorTipo.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">
                    Nenhum documento cadastrado
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-semibold">
                <td className="py-3 px-4">Total</td>
                <td className="py-3 px-4 text-right">{totalDocumentos}</td>
                <td className="py-3 px-4 text-right text-emerald-600">{formatCurrency(valorTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}