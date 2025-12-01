import app from "./app.js";

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
