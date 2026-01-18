import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  parseISO, 
  format, 
  startOfWeek, 
  getWeek, 
  getYear,
  isWithinInterval
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Loader2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { formatCurrency, formatDate, getDayOfWeekShort } from '@/components/shared/formatters';

export default function RelatorioSemanal() {
  const [ano, setAno] = useState(new Date().getFullYear().toString());

  const { data: contas = [], isLoading } = useQuery({
    queryKey: ['contas-relatorio-semanal'],
    queryFn: () => base44.entities.ContaPagar.list('data_vencimento', 1000),
  });

  // Filter by year and group by week
  const contasPorSemana = React.useMemo(() => {
    const filteredContas = contas.filter(conta => {
      if (!conta.data_vencimento) return false;
      const dataVenc = parseISO(conta.data_vencimento);
      return getYear(dataVenc) === parseInt(ano);
    });

    const grouped = {};

    filteredContas.forEach(conta => {
      const dataVenc = parseISO(conta.data_vencimento);
      const semana = getWeek(dataVenc, { locale: ptBR });
      const inicioSemana = startOfWeek(dataVenc, { weekStartsOn: 0 });

      const key = `${semana}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          semana,
          inicioSemana,
          contas: [],
          total: 0
        };
      }

      grouped[key].contas.push(conta);
      grouped[key].total += conta.valor_original || 0;
    });

    return Object.values(grouped).sort((a, b) => a.semana - b.semana);
  }, [contas, ano]);

  const totalGeral = contasPorSemana.reduce((sum, s) => sum + s.total, 0);

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
        title="Relatório por Semana"
        subtitle="Visualize os totais agrupados por semana do ano"
      />

      {/* Filtro */}
      <Card className="p-4 border-0 shadow-lg bg-white mb-6">
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <Label htmlFor="ano" className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Ano
            </Label>
            <Input
              id="ano"
              type="number"
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              className="w-32"
              min="2020"
              max="2030"
            />
          </div>
          <div className="text-sm text-slate-500">
            Total de {contasPorSemana.length} semanas com lançamentos
          </div>
        </div>
      </Card>

      {/* Tabela de Semanas */}
      <Card className="border-0 shadow-lg bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-4 px-4 font-semibold text-slate-700">Semana</th>
                <th className="text-left py-4 px-4 font-semibold text-slate-700">Início da Semana</th>
                <th className="text-center py-4 px-4 font-semibold text-slate-700">Qtd. Contas</th>
                <th className="text-right py-4 px-4 font-semibold text-slate-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {contasPorSemana.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400">
                    Nenhum registro encontrado para {ano}
                  </td>
                </tr>
              ) : (
                contasPorSemana.map((semana) => (
                  <tr key={semana.semana} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600 font-bold">
                        {semana.semana}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {format(semana.inicioSemana, "dd/MM/yyyy", { locale: ptBR })}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {semana.contas.length}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-emerald-600">
                      {formatCurrency(semana.total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {contasPorSemana.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100 font-bold">
                  <td className="py-4 px-4" colSpan={2}>Total Geral</td>
                  <td className="py-4 px-4 text-center">
                    {contasPorSemana.reduce((sum, s) => sum + s.contas.length, 0)}
                  </td>
                  <td className="py-4 px-4 text-right text-emerald-600 text-lg">
                    {formatCurrency(totalGeral)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>
    </div>
  );
}