import {config} from 'dotenv';
config();

import app from './app';
const port = process.env.SERVER_PORT || 3000;

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
