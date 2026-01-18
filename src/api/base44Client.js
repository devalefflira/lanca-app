import { supabase } from '@/lib/supabase';

// Função auxiliar (pode manter a que já existe)
const createCrud = (table) => ({
  list: async (orderBy = 'created_at') => {
    // ... (código existente do createCrud)
    let query = supabase.from(table).select('*');
    if (orderBy.startsWith('-')) {
        query = query.order(orderBy.substring(1), { ascending: false });
    } else {
        query = query.order(orderBy, { ascending: true });
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  create: async (data) => {
    const { data: created, error } = await supabase.from(table).insert(data).select().single();
    if (error) throw error;
    return created;
  },
  update: async (id, data) => {
    const { data: updated, error } = await supabase.from(table).update(data).eq('id', id).select().single();
    if (error) throw error;
    return updated;
  },
  delete: async (id) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    return true;
  }
});

export const base44 = {
  auth: {
    login: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    }
  },
  entities: {
    // --- AQUI ESTÁ A CORREÇÃO PARA EXIBIR OS NOMES ---
    ContaPagar: {
      ...createCrud('tb_contas_pagar'),
      
      // Sobrescreve o LIST para trazer os dados conectados (JOIN)
      list: async () => {
        const { data, error } = await supabase
          .from('tb_contas_pagar')
          .select(`
            *,
            tb_fornecedores ( nome_razao, nome_fantasia ),
            tb_bancos ( nome_banco ),
            tb_razoes ( descricao ),
            tb_parcelas ( descricao ),
            tb_tipos_documento ( descricao )
          `)
          .order('id', { ascending: false }); // Mudei para ID para evitar erro se created_at faltar
        
        if (error) throw error;
        return data;
      }
    },
    // ------------------------------------------------
    
    Fornecedor: createCrud('tb_fornecedores'),
    Banco: createCrud('tb_bancos'),
    TipoDocumento: createCrud('tb_tipos_documento'),
    Razao: createCrud('tb_razoes'),
    Usuario: createCrud('tb_usuarios'),
    Parcela: createCrud('tb_parcelas')
  }
};