//Usado no modelo 1
export default function setItensRoutes(app, db) {
  app.get('/itens', async (req, res) => {
    try {
      let filters = [];

      if (req.query.filters && req.query.filters.trim() !== '') {
        try {
          filters = JSON.parse(req.query.filters);
        } catch (e) {
          return res.status(400).json({ error: 'Formato inválido de filters (deve ser JSON válido)' });
        }
      }

      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

      const results = await db.execute({
        operação: 'select',
        table: 'itens',
        filters,
        options: {
          limit 
        }
      });

      res.json({ results });

    } catch (error) {
      console.error('Erro na rota /itens:', error);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  });
}