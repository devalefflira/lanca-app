import { supabase } from '@/lib/supabase';

// Função auxiliar para criar o CRUD genérico
const createCrud = (table) => ({
  list: async (orderBy = 'created_at', limit = 100) => {
    let query = supabase.from(table).select('*');
    
    // Lógica de ordenação padrão
    if (orderBy.startsWith('-')) {
      query = query.order(orderBy.substring(1), { ascending: false });
    } else {
      query = query.order(orderBy, { ascending: true });
    }
    
    if (limit) query = query.limit(limit);

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
    },
    me: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user; 
    }
  },
  entities: {
    // --- CONTA PAGAR (COM JOIN E ORDENAÇÃO CORRETA) ---
    ContaPagar: {
      ...createCrud('tb_contas_pagar'),
      
      // Sobrescreve o LIST para trazer os dados conectados
      list: async (orderBy = '-created_at', limit = 500) => {
        let query = supabase
          .from('tb_contas_pagar')
          .select(`
            *,
            tb_fornecedores ( nome_razao, nome_fantasia ),
            tb_bancos ( nome_banco ),
            tb_razoes ( descricao ),
            tb_parcelas ( descricao ),
            tb_tipos_documento ( descricao )
          `);

        // Aplica a ordenação solicitada pela tela
        if (orderBy.startsWith('-')) {
            query = query.order(orderBy.substring(1), { ascending: false });
        } else {
            query = query.order(orderBy, { ascending: true });
        }

        if (limit) query = query.limit(limit);
        
        const { data, error } = await query;
        if (error) throw error;
        return data;
      }
    },
    
    Fornecedor: createCrud('tb_fornecedores'),
    Banco: createCrud('tb_bancos'),
    TipoDocumento: createCrud('tb_tipos_documento'),
    Razao: createCrud('tb_razoes'),
    Usuario: createCrud('tb_usuarios'),
    Parcela: createCrud('tb_parcelas'),
    StatusConta: createCrud('tb_status') // Caso você use a tabela de status futuramente
  }
};