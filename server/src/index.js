import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import routes from './routes.js';

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', routes);

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Pokelike API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialise database:', err);
    process.exit(1);
  });
