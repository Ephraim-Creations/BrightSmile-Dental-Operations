import { app } from './app.js';
import { initDatabase } from './db.js';

const PORT = process.env.PORT || 8000;

const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.NETLIFY ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.SERVERLESS
);

if (!isServerless) {
  initDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🦷 BrightSmile Dental Clinic Full-Stack Application`);
      console.log(`🌐 Public Website & API Live at: http://localhost:${PORT}`);
      console.log(`🛡️ Admin Portal:                  http://localhost:${PORT}/admin`);
      console.log(`🔒 Strictly Enforced Admin:        ephraimcreations254@gmail.com`);
      console.log(`======================================================\n`);
    });
  }).catch((err) => {
    console.error('Failed to initialize database on startup:', err);
  });
}

export { app };
export default app;
