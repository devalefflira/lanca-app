import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { parseISO, format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Printer, Loader2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { formatCurrency, formatDate, getDayOfWeek } from '@/components/shared/formatters';

export default function RelatorioDiario() {
  const [dataSelecionada, setDataSelecionada] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const printRef = useRef();

  const { data: contas = [], isLoading } = useQuery({
    queryKey: ['contas-relatorio-diario'],
    queryFn: () => base44.entities.ContaPagar.list('data_vencimento', 1000),
  });

  // Filter by selected date
  const contasDoDia = contas.filter(conta => {
    if (!conta.data_vencimento) return false;
    const dataVenc = parseISO(conta.data_vencimento);
    const dataSel = parseISO(dataSelecionada);
    return isSameDay(dataVenc, dataSel);
  });

  // Resumos
  const resumoPorTipo = {};
  const resumoPorRazao = {};
  const resumoPorBanco = {};

  contasDoDia.forEach(conta => {
    const tipo = conta.tipo_documento || 'Sem Tipo';
    const razao = conta.razao || 'Sem Razão';
    const banco = conta.banco || 'Sem Banco';

    resumoPorTipo[tipo] = (resumoPorTipo[tipo] || 0) + (conta.valor_original || 0);
    resumoPorRazao[razao] = (resumoPorRazao[razao] || 0) + (conta.valor_original || 0);
    resumoPorBanco[banco] = (resumoPorBanco[banco] || 0) + (conta.valor_original || 0);
  });

  const totalDia = contasDoDia.reduce((sum, c) => sum + (c.valor_original || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const formatarDataCompleta = (data) => {
    if (!data) return '-';
    const d = parseISO(data);
    return format(d, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="no-print">
        <PageHeader
          title="Relatório Diário"
          subtitle="Relatório detalhado por dia - Otimizado para impressão"
        />
      </div>

      {/* Filtro e Botão de Impressão */}
      <div className="no-print mb-6">
        <Card className="p-4 border-0 shadow-lg bg-white">
          <div className="flex items-end gap-4 flex-wrap justify-between">
            <div>
              <Label htmlFor="data" className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Selecionar Data
              </Label>
              <Input
                id="data"
                type="date"
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
                className="w-48"
              />
            </div>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Imprimir
            </Button>
          </div>
        </Card>
      </div>

      {/* Conteúdo Imprimível */}
      <div ref={printRef} className="print-content">
        {/* Cabeçalho do Relatório */}
        <div className="mb-6 p-6 bg-slate-900 text-white rounded-xl print:bg-white print:text-black print:border print:border-slate-300">
          <h1 className="text-2xl font-bold mb-2">Relatório de Contas a Pagar</h1>
          <p className="text-lg capitalize">{formatarDataCompleta(dataSelecionada)}</p>
          <p className="text-slate-300 print:text-slate-600">
            Total de {contasDoDia.length} registro(s) | Valor Total: {formatCurrency(totalDia)}
          </p>
        </div>

        {/* Resumos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Por Tipo */}
          <Card className="p-4 border-0 shadow-lg bg-white">
            <h3 className="font-semibold text-slate-700 mb-3 border-b pb-2">Por Tipo de Documento</h3>
            <div className="space-y-2">
              {Object.entries(resumoPorTipo).map(([tipo, valor]) => (
                <div key={tipo} className="flex justify-between text-sm">
                  <span className="text-slate-600">{tipo}</span>
                  <span className="font-medium text-emerald-600">{formatCurrency(valor)}</span>
                </div>
              ))}
              {Object.keys(resumoPorTipo).length === 0 && (
                <p className="text-slate-400 text-sm">Nenhum registro</p>
              )}
            </div>
          </Card>

          {/* Por Razão */}
          <Card className="p-4 border-0 shadow-lg bg-white">
            <h3 className="font-semibold text-slate-700 mb-3 border-b pb-2">Por Razão/Centro de Custo</h3>
            <div className="space-y-2">
              {Object.entries(resumoPorRazao).map(([razao, valor]) => (
                <div key={razao} className="flex justify-between text-sm">
                  <span className="text-slate-600">{razao}</span>
                  <span className="font-medium text-emerald-600">{formatCurrency(valor)}</span>
                </div>
              ))}
              {Object.keys(resumoPorRazao).length === 0 && (
                <p className="text-slate-400 text-sm">Nenhum registro</p>
              )}
            </div>
          </Card>

          {/* Por Banco */}
          <Card className="p-4 border-0 shadow-lg bg-white">
            <h3 className="font-semibold text-slate-700 mb-3 border-b pb-2">Por Banco</h3>
            <div className="space-y-2">
              {Object.entries(resumoPorBanco).map(([banco, valor]) => (
                <div key={banco} className="flex justify-between text-sm">
                  <span className="text-slate-600">{banco}</span>
                  <span className="font-medium text-emerald-600">{formatCurrency(valor)}</span>
                </div>
              ))}
              {Object.keys(resumoPorBanco).length === 0 && (
                <p className="text-slate-400 text-sm">Nenhum registro</p>
              )}
            </div>
          </Card>
        </div>

        {/* Tabela Detalhada */}
        <Card className="border-0 shadow-lg bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-3 font-semibold text-slate-700">Fornecedor</th>
                  <th className="text-left py-3 px-3 font-semibold text-slate-700">Tipo</th>
                  <th className="text-left py-3 px-3 font-semibold text-slate-700">Nº Doc</th>
                  <th className="text-left py-3 px-3 font-semibold text-slate-700">NF</th>
                  <th className="text-left py-3 px-3 font-semibold text-slate-700">Parcela</th>
                  <th className="text-left py-3 px-3 font-semibold text-slate-700">Razão</th>
                  <th className="text-left py-3 px-3 font-semibold text-slate-700">Banco</th>
                  <th className="text-right py-3 px-3 font-semibold text-slate-700">Valor</th>
                  <th className="text-left py-3 px-3 font-semibold text-slate-700 w-24">Anotações</th>
                </tr>
              </thead>
              <tbody>
                {contasDoDia.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400">
                      Nenhuma conta para esta data
                    </td>
                  </tr>
                ) : (
                  contasDoDia.map((conta) => (
                    <tr key={conta.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-3 font-medium">{conta.nome_fornecedor || '-'}</td>
                      <td className="py-3 px-3">{conta.tipo_documento || '-'}</td>
                      <td className="py-3 px-3">{conta.numero_documento || '-'}</td>
                      <td className="py-3 px-3">{conta.nota_fiscal || '-'}</td>
                      <td className="py-3 px-3">{conta.parcela || '-'}</td>
                      <td className="py-3 px-3">{conta.razao || '-'}</td>
                      <td className="py-3 px-3">{conta.banco || '-'}</td>
                      <td className="py-3 px-3 text-right font-medium text-emerald-600">
                        {formatCurrency(conta.valor_original)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="border-b border-dashed border-slate-300 min-h-[24px]"></div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {contasDoDia.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-100 font-bold">
                    <td className="py-3 px-3" colSpan={7}>Total do Dia</td>
                    <td className="py-3 px-3 text-right text-emerald-600">
                      {formatCurrency(totalDia)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </Card>
      </div>

      {/* Estilos de Impressão */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: portrait;
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}