import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Routes will be built step by step
  
  const httpServer = createServer(app);
  return httpServer;
}