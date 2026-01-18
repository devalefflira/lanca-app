import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function ContaModal({ open, onClose, editingItem, onSave, isLoading }) {
  const { register, handleSubmit, control, reset, setValue } = useForm();
  
  // Carregar listas auxiliares
  const { data: fornecedores = [] } = useQuery({ queryKey: ['fornecedores'], queryFn: () => base44.entities.Fornecedor.list() });
  const { data: tipos = [] } = useQuery({ queryKey: ['tipos'], queryFn: () => base44.entities.TipoDocumento.list() });
  const { data: bancos = [] } = useQuery({ queryKey: ['bancos'], queryFn: () => base44.entities.Banco.list() });
  const { data: razoes = [] } = useQuery({ queryKey: ['razoes'], queryFn: () => base44.entities.Razao.list() });
  const { data: parcelas = [] } = useQuery({ queryKey: ['parcelas'], queryFn: () => base44.entities.Parcela.list() });
  const { data: statusList = [] } = useQuery({ queryKey: ['status'], queryFn: () => base44.entities.StatusConta.list() });

  useEffect(() => {
    if (editingItem) {
      reset(editingItem);
      // Garantir que datas venham no formato YYYY-MM-DD para o input
      setValue('data_vencimento', editingItem.data_vencimento?.split('T')[0]);
      setValue('data_competencia', editingItem.data_competencia?.split('T')[0]);
    } else {
      reset({
        data_competencia: new Date().toISOString().split('T')[0],
        id_status: 1 // Default Pendente
      });
    }
  }, [editingItem, open, reset, setValue]);

  const onSubmit = (data) => {
    // Parser de tipos para garantir envio correto ao Supabase
    const payload = {
        ...data,
        valor_original: parseFloat(data.valor_original),
        id_fornecedor: parseInt(data.id_fornecedor),
        id_tipo_documento: data.id_tipo_documento ? parseInt(data.id_tipo_documento) : null,
        id_banco: data.id_banco ? parseInt(data.id_banco) : null,
        id_razao: data.id_razao ? parseInt(data.id_razao) : null,
        id_parcela: data.id_parcela ? parseInt(data.id_parcela) : null,
        id_status: data.id_status ? parseInt(data.id_status) : null,
    };
    onSave(payload, false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isLoading && !val && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Editar Conta' : 'Nova Conta a Pagar'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Vencimento *</Label>
              <Input type="date" {...register('data_vencimento', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>Competência</Label>
              <Input type="date" {...register('data_competencia')} />
            </div>
            <div className="space-y-2">
               <Label>Valor Original (R$) *</Label>
               <Input type="number" step="0.01" {...register('valor_original', { required: true })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label>Fornecedor *</Label>
                <Controller
                  name="id_fornecedor"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {fornecedores.map(i => <SelectItem key={i.id} value={i.id.toString()}>{i.nome_razao}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
             </div>
             <div className="space-y-2">
                <Label>Tipo de Documento</Label>
                <Controller
                  name="id_tipo_documento"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {tipos.map(i => <SelectItem key={i.id} value={i.id.toString()}>{i.descricao}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input placeholder="Nº Documento" {...register('numero_documento')} />
            <Input placeholder="Nota Fiscal" {...register('nota_fiscal')} />
            <Controller
                name="id_parcela"
                control={control}
                render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value?.toString()}>
                    <SelectTrigger><SelectValue placeholder="Parcela" /></SelectTrigger>
                    <SelectContent>
                    {parcelas.map(i => <SelectItem key={i.id} value={i.id.toString()}>{i.descricao}</SelectItem>)}
                    </SelectContent>
                </Select>
                )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="space-y-2">
                <Label>Banco</Label>
                <Controller
                  name="id_banco"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {bancos.map(i => <SelectItem key={i.id} value={i.id.toString()}>{i.nome_banco}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
             </div>
             <div className="space-y-2">
                <Label>Razão Social</Label>
                <Controller
                  name="id_razao"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {razoes.map(i => <SelectItem key={i.id} value={i.id.toString()}>{i.descricao}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
             </div>
             <div className="space-y-2">
                <Label>Status</Label>
                <Controller
                  name="id_status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {statusList.map(i => <SelectItem key={i.id} value={i.id.toString()}>{i.descricao}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
             </div>
          </div>

          <div className="space-y-2">
             <Label>Observação</Label>
             <Textarea {...register('observacao')} />
          </div>

          <DialogFooter>
             <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>Cancelar</Button>
             <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
               {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
               Salvar
             </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}