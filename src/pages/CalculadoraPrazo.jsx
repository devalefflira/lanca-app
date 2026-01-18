import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { addDays, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/shared/PageHeader';

export default function CalculadoraPrazo() {
  const [dataBase, setDataBase] = useState('');
  const [prazos, setPrazos] = useState(Array(12).fill(''));
  const [copied, setCopied] = useState(false);

  const handlePrazoChange = (index, value) => {
    const newPrazos = [...prazos];
    newPrazos[index] = value;
    setPrazos(newPrazos);
  };

  const calcularData = (dias) => {
    if (!dataBase || !dias) return null;
    const base = parseISO(dataBase);
    return addDays(base, parseInt(dias));
  };

  const formatarData = (data) => {
    if (!data) return '-';
    return format(data, 'dd/MM/yyyy', { locale: ptBR });
  };

  const gerarStringPrazos = () => {
    const prazosPreenchidos = prazos.filter(p => p !== '' && !isNaN(parseInt(p)));
    return prazosPreenchidos.join('/');
  };

  const copiarPrazos = () => {
    const texto = gerarStringPrazos();
    if (texto) {
      navigator.clipboard.writeText(texto);
      setCopied(true);
      toast.success('Prazos copiados!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const limparPrazos = () => {
    setPrazos(Array(12).fill(''));
  };

  const preenchimentoRapido = (incremento) => {
    const novosPrazos = Array(12).fill('').map((_, i) => String(incremento * (i + 1)));
    setPrazos(novosPrazos);
  };

  return (
    <div>
      <PageHeader
        title="Calculadora de Prazo"
        subtitle="Calcule datas a partir de prazos em dias"
      />

      <div className="max-w-4xl mx-auto">
        <Card className="p-6 border-0 shadow-xl bg-white">
          {/* Data Base */}
          <div className="mb-6">
            <Label htmlFor="data_base" className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Data Base
            </Label>
            <Input
              id="data_base"
              type="date"
              value={dataBase}
              onChange={(e) => setDataBase(e.target.value)}
              className="max-w-xs text-lg"
            />
          </div>

          {/* Preenchimento Rápido */}
          <div className="mb-6 flex flex-wrap gap-2">
            <span className="text-sm text-slate-500 self-center mr-2">Preenchimento rápido:</span>
            <Button variant="outline" size="sm" onClick={() => preenchimentoRapido(7)}>
              7 em 7
            </Button>
            <Button variant="outline" size="sm" onClick={() => preenchimentoRapido(14)}>
              14 em 14
            </Button>
            <Button variant="outline" size="sm" onClick={() => preenchimentoRapido(30)}>
              30 em 30
            </Button>
            <Button variant="outline" size="sm" onClick={limparPrazos}>
              Limpar
            </Button>
          </div>

          {/* Tabela de Prazos */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 w-16">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Prazo (dias)</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Data Calculada</th>
                </tr>
              </thead>
              <tbody>
                {prazos.map((prazo, index) => {
                  const dataCalculada = calcularData(prazo);
                  return (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-500">{index + 1}</td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          value={prazo}
                          onChange={(e) => handlePrazoChange(index, e.target.value)}
                          placeholder="Dias"
                          className="w-24"
                        />
                      </td>
                      <td className="py-3 px-4">
                        {dataCalculada ? (
                          <span className="font-medium text-blue-600">
                            {formatarData(dataCalculada)}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Resultado Concatenado */}
          {gerarStringPrazos() && (
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Prazos (formato concatenado):</p>
                  <p className="text-xl font-bold text-blue-600 font-mono">
                    {gerarStringPrazos()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={copiarPrazos}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Instruções */}
          {!dataBase && (
            <div className="mt-6 text-center text-slate-400 py-4">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Selecione a data base para começar</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}