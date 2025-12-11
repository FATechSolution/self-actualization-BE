import app from "./app.js";

// Import notification cron jobs (only for non-serverless environments)
if (!process.env.VERCEL && !process.env.VERCEL_ENV) {
  import('./jobs/notificationJobs.js').catch((err) => {
    console.error('⚠️  Failed to load notification cron jobs:', err.message);
    console.log('   Note: Make sure node-cron is installed: npm install node-cron');
  });
}

// For local development, start the server
if (!process.env.VERCEL && !process.env.VERCEL_ENV) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port http://localhost:${PORT}`);
  });
}

// Export as Vercel serverless function handler
// Vercel expects the default export to be the Express app
export default app;
