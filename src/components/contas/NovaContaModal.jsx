import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription, // Adicionado aqui corretamente
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// Função Helper segura para converter string em Inteiro ou Null
const toInt = (val) => {
  if (!val || val === '') return null;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? null : parsed;
};

export default function NovaContaModal({ open, onOpenChange, onSave, isLoading, contaParaEditar = null }) {
  // Buscas de Dados
  const { data: fornecedores = [] } = useQuery({ queryKey: ['fornecedores'], queryFn: () => base44.entities.Fornecedor.list('nome_razao') });
  const { data: tipos = [] } = useQuery({ queryKey: ['tipos-documento'], queryFn: () => base44.entities.TipoDocumento.list('descricao') });
  const { data: bancos = [] } = useQuery({ queryKey: ['bancos'], queryFn: () => base44.entities.Banco.list('nome_banco') });
  const { data: razoes = [] } = useQuery({ queryKey: ['razoes'], queryFn: () => base44.entities.Razao.list('descricao') });
  const { data: parcelas = [] } = useQuery({ queryKey: ['parcelas'], queryFn: () => base44.entities.Parcela.list('descricao') });

  const initialFormState = {
    id_fornecedor: '', valor_original: '', data_vencimento: '', data_competencia: '',
    id_tipo_documento: '', numero_documento: '', nota_fiscal: '', id_parcela: '',
    id_banco: '', id_razao: '', status: 'Pendente', observacao: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (contaParaEditar && open) {
      setFormData({
        id_fornecedor: contaParaEditar.id_fornecedor?.toString() || '',
        valor_original: contaParaEditar.valor_original || '',
        data_vencimento: contaParaEditar.data_vencimento ? contaParaEditar.data_vencimento.split('T')[0] : '',
        data_competencia: contaParaEditar.data_competencia ? contaParaEditar.data_competencia.split('T')[0] : '',
        id_tipo_documento: contaParaEditar.id_tipo_documento?.toString() || '',
        numero_documento: contaParaEditar.numero_documento || '',
        nota_fiscal: contaParaEditar.nota_fiscal || '',
        id_parcela: contaParaEditar.id_parcela?.toString() || '',
        id_banco: contaParaEditar.id_banco?.toString() || '',
        id_razao: contaParaEditar.id_razao?.toString() || '',
        status: contaParaEditar.status || 'Pendente',
        observacao: contaParaEditar.observacao || ''
      });
    } else if (open) {
      setFormData(initialFormState);
    }
  }, [contaParaEditar, open]);

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.id_fornecedor) {
        alert("Selecione um Fornecedor!");
        return;
    }

    const payload = {
      ...formData,
      id_fornecedor: toInt(formData.id_fornecedor),
      id_tipo_documento: toInt(formData.id_tipo_documento),
      id_banco: toInt(formData.id_banco),
      id_razao: toInt(formData.id_razao),
      id_parcela: toInt(formData.id_parcela),
      valor_original: parseFloat(String(formData.valor_original).replace(',', '.') || 0),
    };
    onSave(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>{contaParaEditar ? 'Editar Conta' : 'Nova Conta a Pagar'}</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para {contaParaEditar ? 'editar' : 'criar'} uma conta no sistema.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Linha 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Vencimento *</Label>
              <Input type="date" value={formData.data_vencimento} onChange={e => handleChange('data_vencimento', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Competência</Label>
              <Input type="date" value={formData.data_competencia} onChange={e => handleChange('data_competencia', e.target.value)} />
            </div>
            <div className="space-y-2">
               <Label>Valor Original (R$) *</Label>
               <Input type="number" step="0.01" value={formData.valor_original} onChange={e => handleChange('valor_original', e.target.value)} required />
            </div>
          </div>
          {/* Linha 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label>Fornecedor *</Label>
                <Select value={formData.id_fornecedor} onValueChange={v => handleChange('id_fornecedor', v)} required>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent className="bg-white max-h-[200px]">
                    {fornecedores.map(f => (<SelectItem key={f.id} value={f.id.toString()}>{f.nome_razao || f.nome_fantasia}</SelectItem>))}
                  </SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
                <Label>Tipo de Documento</Label>
                <Select value={formData.id_tipo_documento} onValueChange={v => handleChange('id_tipo_documento', v)}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent className="bg-white">
                    {tipos.map(t => (<SelectItem key={t.id} value={t.id.toString()}>{t.descricao}</SelectItem>))}
                  </SelectContent>
                </Select>
             </div>
          </div>
          {/* Linha 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Nº Documento</Label>
              <Input value={formData.numero_documento} onChange={e => handleChange('numero_documento', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Nota Fiscal</Label>
              <Input value={formData.nota_fiscal} onChange={e => handleChange('nota_fiscal', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Parcela</Label>
              <Select value={formData.id_parcela} onValueChange={v => handleChange('id_parcela', v)}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent className="bg-white">
                    {parcelas.map(p => (<SelectItem key={p.id} value={p.id.toString()}>{p.descricao}</SelectItem>))}
                  </SelectContent>
                </Select>
            </div>
          </div>
          {/* Linha 4 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="space-y-2">
                <Label>Banco</Label>
                <Select value={formData.id_banco} onValueChange={v => handleChange('id_banco', v)}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent className="bg-white">
                    {bancos.map(b => (<SelectItem key={b.id} value={b.id.toString()}>{b.nome_banco}</SelectItem>))}
                  </SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
                <Label>Razão Social</Label>
                <Select value={formData.id_razao} onValueChange={v => handleChange('id_razao', v)}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent className="bg-white">
                    {razoes.map(r => (<SelectItem key={r.id} value={r.id.toString()}>{r.descricao}</SelectItem>))}
                  </SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => handleChange('status', v)}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Pago">Pago</SelectItem>
                  </SelectContent>
                </Select>
             </div>
          </div>
          <div className="space-y-2">
             <Label>Observação</Label>
             <Textarea value={formData.observacao} onChange={e => handleChange('observacao', e.target.value)} />
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar Conta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}