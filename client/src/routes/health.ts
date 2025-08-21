import { Router, Request, Response } from 'express';
import { database } from '../config/database';
import { config } from '../config/environment';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     HealthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               enum: [healthy, unhealthy]
 *             timestamp:
 *               type: string
 *               format: date-time
 *             uptime:
 *               type: number
 *               description: Server uptime in seconds
 *             environment:
 *               type: string
 *             version:
 *               type: string
 *             database:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [connected, disconnected]
 *                 responseTime:
 *                   type: number
 *                   description: Database response time in milliseconds
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *       503:
 *         description: Service is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get('/', async (_req: Request, res: Response) => {
  const startTime = Date.now();
  let dbStatus = 'disconnected';
  let dbResponseTime = 0;
  let overallStatus = 'healthy';

  try {
    // Test database connection
    const dbStartTime = Date.now();
    await database.query('SELECT 1');
    dbResponseTime = Date.now() - dbStartTime;
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'disconnected';
    overallStatus = 'unhealthy';
  }

  const healthData = {
    success: overallStatus === 'healthy',
    message: `Service is ${overallStatus}`,
    data: {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: dbStatus,
        responseTime: dbResponseTime,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      responseTime: Date.now() - startTime,
    },
  };

  const statusCode = overallStatus === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthData);
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    // Check if database is ready
    await database.query('SELECT 1');

    res.status(200).json({
      success: true,
      message: 'Service is ready',
      data: {
        status: 'ready',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Service is not ready',
      data: {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
      },
    });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Service is alive',
    data: {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

export default router;