import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import CrudModal from '@/components/shared/CrudModal';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';

export default function Parcelas() {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ descricao: '' });
  const queryClient = useQueryClient();

  // Busca dados
  const { data: parcelas = [], isLoading } = useQuery({
    queryKey: ['parcelas'],
    queryFn: () => base44.entities.Parcela.list('descricao'),
  });

  // Criar
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Parcela.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcelas'] });
      toast.success('Parcela criada com sucesso!');
      closeModal();
    },
    onError: () => toast.error('Erro ao criar parcela.')
  });

  // Atualizar
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Parcela.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcelas'] });
      toast.success('Parcela atualizada!');
      closeModal();
    },
  });

  // Deletar
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Parcela.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcelas'] });
      toast.success('Parcela removida!');
      setDeleteOpen(false);
    },
  });

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setForm({ descricao: '' });
  };

  const handleSave = () => {
    if (!form.descricao) return toast.warning('Preencha a descrição');
    
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div>
      <PageHeader 
        title="Parcelas" 
        subtitle="Gerencie as opções de parcelamento (ex: 01/12, Fixa)"
        onAdd={() => setModalOpen(true)}
      />

      <DataTable 
        columns={[{ header: 'Descrição', accessor: 'descricao' }]}
        data={parcelas}
        isLoading={isLoading}
        onEdit={(item) => { setEditingItem(item); setForm({ descricao: item.descricao }); setModalOpen(true); }}
        onDelete={(item) => { setEditingItem(item); setDeleteOpen(true); }}
      />

      <CrudModal
        open={modalOpen}
        onClose={closeModal}
        title={editingItem ? 'Editar Parcela' : 'Nova Parcela'}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      >
        <div className="space-y-2">
          <Label>Descrição (Ex: 01/12)</Label>
          <Input 
            value={form.descricao} 
            onChange={e => setForm({...form, descricao: e.target.value})} 
          />
        </div>
      </CrudModal>

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(editingItem?.id)}
      />
    </div>
  );
}