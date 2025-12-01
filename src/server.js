import app from "./app.js";

// For local development, start the server
if (!process.env.VERCEL && !process.env.VERCEL_ENV) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port http://localhost:${PORT}`);
  });
}

// Export as Vercel serverless function
// Vercel will use this as the handler
export default app;
