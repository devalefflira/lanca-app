import React from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function ContaFilters({ filters, setFilters }) {
  const { data: fornecedores = [] } = useQuery({ queryKey: ['fornecedores'], queryFn: () => base44.entities.Fornecedor.list() });
  const { data: tipos = [] } = useQuery({ queryKey: ['tipos'], queryFn: () => base44.entities.TipoDocumento.list() });

  const handleChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      dataInicio: '', dataFim: '', fornecedor: '', valorMin: '', valorMax: '', tipoDocumento: '', notaFiscal: '', numeroDocumento: ''
    });
  };

  return (
    <Card className="p-4 mb-6 border-0 shadow-sm bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Datas */}
        <Input type="date" value={filters.dataInicio} onChange={e => handleChange('dataInicio', e.target.value)} placeholder="Data Início" />
        <Input type="date" value={filters.dataFim} onChange={e => handleChange('dataFim', e.target.value)} placeholder="Data Fim" />
        
        {/* Fornecedor */}
        <Select value={filters.fornecedor?.toString()} onValueChange={v => handleChange('fornecedor', parseInt(v))}>
          <SelectTrigger><SelectValue placeholder="Fornecedor" /></SelectTrigger>
          <SelectContent>
            {fornecedores.map(f => <SelectItem key={f.id} value={f.id.toString()}>{f.nome_razao}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Tipo Doc */}
        <Select value={filters.tipoDocumento?.toString()} onValueChange={v => handleChange('tipoDocumento', parseInt(v))}>
          <SelectTrigger><SelectValue placeholder="Tipo Doc" /></SelectTrigger>
          <SelectContent>
            {tipos.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.descricao}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Inputs Texto */}
        <Input placeholder="Nº Documento" value={filters.numeroDocumento} onChange={e => handleChange('numeroDocumento', e.target.value)} />
        <Input placeholder="Nota Fiscal" value={filters.notaFiscal} onChange={e => handleChange('notaFiscal', e.target.value)} />
        
        {/* Valores */}
        <div className="flex gap-2">
           <Input placeholder="Min R$" type="number" value={filters.valorMin} onChange={e => handleChange('valorMin', e.target.value)} />
           <Input placeholder="Max R$" type="number" value={filters.valorMax} onChange={e => handleChange('valorMax', e.target.value)} />
        </div>

        <Button variant="outline" onClick={clearFilters} className="w-full border-dashed text-slate-500 hover:text-red-500 hover:border-red-200">
          <X className="w-4 h-4 mr-2" /> Limpar Filtros
        </Button>
      </div>
    </Card>
  );
}