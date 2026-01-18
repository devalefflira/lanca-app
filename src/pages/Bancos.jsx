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

export default function Bancos() {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ nome_banco: '' });
  const queryClient = useQueryClient();

  const { data: bancos = [], isLoading } = useQuery({
    queryKey: ['bancos'],
    queryFn: () => base44.entities.Banco.list('nome_banco'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Banco.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bancos'] });
      toast.success('Banco cadastrado com sucesso!');
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Banco.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bancos'] });
      toast.success('Banco atualizado com sucesso!');
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Banco.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bancos'] });
      toast.success('Banco excluído com sucesso!');
      setDeleteOpen(false);
      setEditingItem(null);
    },
  });

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setForm({ nome_banco: '' });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({ nome_banco: item.nome_banco || '' });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.nome_banco.trim()) {
      toast.error('Nome do banco é obrigatório');
      return;
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const columns = [
    { header: 'Nome do Banco', accessor: 'nome_banco' }
  ];

  return (
    <div>
      <PageHeader
        title="Bancos"
        subtitle="Gerencie os bancos cadastrados"
        onAdd={() => setModalOpen(true)}
        addLabel="Novo Banco"
      />

      <DataTable
        columns={columns}
        data={bancos}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={(item) => { setEditingItem(item); setDeleteOpen(true); }}
        emptyMessage="Nenhum banco cadastrado"
      />

      <CrudModal
        open={modalOpen}
        onClose={closeModal}
        title={editingItem ? 'Editar Banco' : 'Novo Banco'}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      >
        <div>
          <Label htmlFor="nome_banco">Nome do Banco *</Label>
          <Input
            id="nome_banco"
            value={form.nome_banco}
            onChange={(e) => setForm({ nome_banco: e.target.value })}
            placeholder="Ex: Banco do Brasil, Itaú"
            className="mt-1"
          />
        </div>
      </CrudModal>

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(editingItem?.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}