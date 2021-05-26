import {config} from 'dotenv';

import app from './app';
config();
const port = process.env.SERVER_PORT || 3000;

app.listen(port, () => {
  console.log(`Search token server listening at http://localhost:${port}`);
});
