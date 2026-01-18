import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { differenceInDays, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';

export default function ContarDias() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const calcularDiferenca = () => {
    if (!dataInicio || !dataFim) return null;
    
    const inicio = parseISO(dataInicio);
    const fim = parseISO(dataFim);
    const dias = differenceInDays(fim, inicio);
    
    return dias;
  };

  const diferenca = calcularDiferenca();

  const formatarData = (data) => {
    if (!data) return '-';
    return format(parseISO(data), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <div>
      <PageHeader
        title="Contar Dias"
        subtitle="Calcule a diferença em dias entre duas datas"
      />

      <div className="max-w-2xl mx-auto">
        <Card className="p-6 border-0 shadow-xl bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Data Início */}
            <div>
              <Label htmlFor="data_inicio" className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Data Início
              </Label>
              <Input
                id="data_inicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="text-lg"
              />
              {dataInicio && (
                <p className="mt-2 text-sm text-slate-500 capitalize">
                  {formatarData(dataInicio)}
                </p>
              )}
            </div>

            {/* Data Fim */}
            <div>
              <Label htmlFor="data_fim" className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Data Fim
              </Label>
              <Input
                id="data_fim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="text-lg"
              />
              {dataFim && (
                <p className="mt-2 text-sm text-slate-500 capitalize">
                  {formatarData(dataFim)}
                </p>
              )}
            </div>
          </div>

          {/* Resultado */}
          {diferenca !== null && (
            <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <div className="flex items-center justify-center gap-4 text-slate-600 mb-4">
                <span className="text-sm">Data Início</span>
                <ArrowRight className="w-4 h-4" />
                <span className="text-sm">Data Fim</span>
              </div>
              <div className="text-center">
                <span className="text-5xl font-bold text-blue-600">
                  {Math.abs(diferenca)}
                </span>
                <span className="text-xl text-slate-600 ml-2">
                  {Math.abs(diferenca) === 1 ? 'dia' : 'dias'}
                </span>
                {diferenca < 0 && (
                  <p className="mt-2 text-sm text-amber-600">
                    (A data início é posterior à data fim)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Instruções */}
          {diferenca === null && (
            <div className="mt-8 text-center text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Selecione as datas para calcular a diferença</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}