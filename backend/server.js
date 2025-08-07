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
  windowMs: 5 * 60 * 1000,
  max: 100,
});

const CorsOptions = {
  credentials: true,
  origin: ['http://devutils.dev.br', 'http://localhost:3000'] // HTTP no domínio
};

// Caminhos para HTML
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conexão com banco
import db_connection from './db/db_conn.js';
const db = new db_connection();

// Rotas
import setItensRoutes from './routes/Table_itens.js';
import setSQLRoutes   from './routes/SQL_Utils.js';

const app = express();
app.use(cors(CorsOptions));
app.use(express.json());
app.use(limiter);

const version    = '03';
let frontendPath = '';

try {  
  await db.connect();

  switch (version) {
    case '01':
      frontendPath = path.join(__dirname, '../projects/01 - grid');
      break;
    case '02':
      frontendPath = path.join(__dirname, '../projects/02 - SQLFunctions');
      break;
    case '03':
      frontendPath = path.join(__dirname, '../projects/03 - basic_menu');
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
  setSQLRoutes(app, db);

  // configuração do servidor HTTPS - não tenho certificado SSL
  /*const httpsOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/devutils.dev.br/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/devutils.dev.br/fullchain.pem')
  };

  // Servidor HTTPS
  https.createServer(httpsOptions, app).listen(443, () => {
    console.log('Servidor rodando em https://devutils.dev.br');
  });*/

  app.listen(process.env.EXPRESS_PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://devutils.dev.br:${process.env.EXPRESS_PORT} ou 'http://localhost:3000'`);
  });

} catch (err) {
  console.error('Erro ao iniciar servidor: banco de dados indisponível.');
  process.exit(1);
}
