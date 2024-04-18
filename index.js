const dotenv = require('dotenv');
const http = require('http');


dotenv.config({ path: 'config.env' });
const app = require('./app');
const server = http.createServer(app);

const PORT = process.env.PORT || 3003;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});