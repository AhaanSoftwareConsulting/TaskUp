const app = require('./src/app');
const config = require('./src/config/config');
const { pool } = require('./src/config/database');

app.locals.dbReady = false;

async function connectDb() {
  for (let attempt = 1; ; attempt++) {
    try {
      const conn = await pool.getConnection();
      conn.release();
      app.locals.dbReady = true;
      console.log('Connected to MySQL');
      return;
    } catch (err) {
      app.locals.dbReady = false;
      console.error(`DB not available (attempt ${attempt}): ${err.message}`);
      await new Promise((r) => setTimeout(r, Math.min(60_000, 5_000 * attempt))); // backs off, capped at 1/min
    }
  }
}

app.listen(config.app.port, () => console.log(`${config.app.name} listening on port ${config.app.port} (${config.app.env})`));
connectDb();