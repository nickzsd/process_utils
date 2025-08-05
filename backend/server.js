// Trata questões de segurança, como rate limiting e CORS
import path      from 'path';
import { fileURLToPath } from 'url';

import rateLimit from 'express-rate-limit';
import dotenv    from 'dotenv';

import cors      from 'cors';
import express   from 'express';

import https     from 'https';
import fs        from 'fs';

dotenv.config();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const CorsOptions = {
  credentials: true,
  origin: ['https://devutils.dev.br', 'http://127.0.0.1:5500'] // HTTPS no domínio
};

// Caminhos para HTML
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conexão com banco
import db_connection from './db/db_conn.js';
const db = new db_connection();

// Rotas
import setItensRoutes from './routes/Table_itens.js';

const app = express();
app.use(cors(CorsOptions));
app.use(express.json());
app.use(limiter);

const version = '01';
let frontendPath = '';

try {  
  await db.connect();

  switch (version) {
    case '01':
      frontendPath = path.join(__dirname, '../projects/01 - grid');
      break;
    default:
      console.error('Versão inválida especificada.');
      process.exit(1);
  }

  app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });

  app.use(express.static(frontendPath));

  app.get('/check', (req, res) => {
    res.send('Está funcionando!');
  });

  setItensRoutes(app, db);

  // configuração do servidor HTTPS - não tenho certificado SSL
  /*const httpsOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/devutils.dev.br/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/devutils.dev.br/fullchain.pem')
  };

  // Servidor HTTPS
  https.createServer(httpsOptions, app).listen(443, () => {
    console.log('Servidor rodando em https://devutils.dev.br');
  });*/

  app.listen(process.env.EXPRESS_PORT, () => {
    console.log(`Servidor rodando em http://devutils.dev.br:${process.env.EXPRESS_PORT}`);
  });

} catch (err) {
  console.error('Erro ao iniciar servidor: banco de dados indisponível.');
  process.exit(1);
}
