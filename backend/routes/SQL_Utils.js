import sleep from '../utils/utils.js'


//Usado no modulo 2
export default function setSQLRoutes(app, db) {
  app.get('/query', async (req, res) => {
    try {
      let filters = [];      

      if (req.query.filters && req.query.filters.trim() !== '') {
        try {
          filters = JSON.parse(req.query.filters);
        } catch (e) {
          return res.status(400).json({ error: 'Formato inválido de filters (deve ser JSON válido)' });
        }
      }
      
      const table = req.query.table ? req.query.table.trim()    : '';
      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;      

      const results = await db.execute({
        operação: 'select',
        table: table,
        filters,
        options: {
          limit 
        }
      });

      res.json({ results });

    } catch (error) {
      console.error('Erro na rota', error);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  });

  app.get('/statecheck', async (req, res) => {
    const ref_id = req.query.ref_id ? req.query.ref_id.trim() : ''; 
    const limit = 1;
    
    let ret = 0;
    let isClosed = false;

    if(!ref_id)
        return res.status(400).json({ error: 'Parâmetro ref_id é obrigatório' });

    try {
        const [rows] = await db.getConnection().query('select recId from validate_check where ref_id = ?', [ref_id]);

        if (rows.length !== 0) 
            return res.status(400).json({ log: 'Validação pendente para ' + ref_id });        

        await db.getConnection().query('insert into validate_check (ref_id, ref_state) values (?, ?)', [ref_id, 0]);
        
        req.on('close', async () => {
            isClosed = true;
            console.log(`Conexão fechada pelo cliente: ${ref_id}`);
            await db.getConnection().query('delete from validate_check where ref_id = ?', [ref_id]);
        });

        while (!isClosed) {
            const [results] = await db.getConnection().query('select ref_state from validate_check where ref_id = ?', [ref_id]);

            if (results[0]?.ref_state != ret) {
                ret = results[0]?.ref_state;
                break;
            }

            await sleep(1000); 
        }

        if (!isClosed) {
            console.log('Resultado final da verificação:', ret);
            await db.getConnection().query('delete from validate_check where ref_id = ?', [ref_id]);
            res.json({ return: ret });
        }

    } catch (error) {
        console.error('Erro na rota', error);
        if (!res.headersSent) 
            res.status(500).json({ error: 'Erro interno no servidor' });        
    }
    });
 
}