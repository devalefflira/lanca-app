import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDays, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Plus } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';

export default function SomarDias() {
  const [dataBase, setDataBase] = useState('');
  const [dias, setDias] = useState('');

  const calcularNovaData = () => {
    if (!dataBase || dias === '') return null;
    
    const base = parseISO(dataBase);
    const novaData = addDays(base, parseInt(dias) || 0);
    
    return novaData;
  };

  const novaData = calcularNovaData();

  const formatarData = (data) => {
    if (!data) return '-';
    const d = typeof data === 'string' ? parseISO(data) : data;
    return format(d, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatarDataCurta = (data) => {
    if (!data) return '-';
    const d = typeof data === 'string' ? parseISO(data) : data;
    return format(d, "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <div>
      <PageHeader
        title="Somar Dias"
        subtitle="Calcule uma nova data adicionando dias a uma data base"
      />

      <div className="max-w-2xl mx-auto">
        <Card className="p-6 border-0 shadow-xl bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Data Base */}
            <div>
              <Label htmlFor="data_base" className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Data Base
              </Label>
              <Input
                id="data_base"
                type="date"
                value={dataBase}
                onChange={(e) => setDataBase(e.target.value)}
                className="text-lg"
              />
              {dataBase && (
                <p className="mt-2 text-sm text-slate-500 capitalize">
                  {formatarData(dataBase)}
                </p>
              )}
            </div>

            {/* Dias a somar */}
            <div>
              <Label htmlFor="dias" className="flex items-center gap-2 mb-2">
                <Plus className="w-4 h-4 text-blue-500" />
                Dias a Somar
              </Label>
              <Input
                id="dias"
                type="number"
                value={dias}
                onChange={(e) => setDias(e.target.value)}
                placeholder="Ex: 30"
                className="text-lg"
              />
              <p className="mt-2 text-sm text-slate-500">
                Use valores negativos para subtrair
              </p>
            </div>
          </div>

          {/* Resultado */}
          {novaData && (
            <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
              <p className="text-center text-slate-600 mb-2">Nova Data</p>
              <div className="text-center">
                <span className="text-4xl font-bold text-emerald-600">
                  {formatarDataCurta(novaData)}
                </span>
              </div>
              <p className="text-center text-slate-600 mt-3 capitalize">
                {formatarData(novaData)}
              </p>
            </div>
          )}

          {/* Instruções */}
          {!novaData && (
            <div className="mt-8 text-center text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Selecione a data base e informe os dias a somar</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}