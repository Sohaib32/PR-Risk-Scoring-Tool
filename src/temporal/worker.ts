/**
 * Temporal Worker for PR Risk Analysis
 * The worker runs workflows and activities
 */

import { NativeConnection, Worker } from "@temporalio/worker";
import * as activities from "./activities";
import { logger } from "../utils/logger";

/**
 * Create and run a Temporal worker
 */
export async function runWorker(
  options: {
    taskQueue?: string;
    connection?: NativeConnection;
    maxConcurrentActivityTaskExecutions?: number;
    maxConcurrentWorkflowTaskExecutions?: number;
  } = {}
): Promise<void> {
  const {
    taskQueue = "pr-risk-analysis",
    connection,
    maxConcurrentActivityTaskExecutions = 10,
    maxConcurrentWorkflowTaskExecutions = 10,
  } = options;

  // Create connection if not provided
  const temporalConnection =
    connection ||
    (await NativeConnection.connect({
      address: process.env.TEMPORAL_ADDRESS || "localhost:7233",
    }));

  // Determine workflows path - use compiled JS in production, TS in development
  const workflowsPath =
    process.env.NODE_ENV === "production"
      ? require.resolve("./workflows")
      : require.resolve("./workflows.ts");

  const worker = await Worker.create({
    connection: temporalConnection,
    namespace: process.env.TEMPORAL_NAMESPACE || "default",
    taskQueue,
    workflowsPath,
    activities: {
      ...activities.riskAnalysisActivities,
    },
    maxConcurrentActivityTaskExecutions,
    maxConcurrentWorkflowTaskExecutions,
  });

  logger.info(`Worker started on task queue: ${taskQueue}`);
  logger.info(
    `Temporal address: ${process.env.TEMPORAL_ADDRESS || "localhost:7233"}`
  );

  // Run worker until interrupted
  await worker.run();
}

/**
 * Main entry point for running the worker
 */
async function main() {
  try {
    await runWorker();
  } catch (error) {
    logger.error("Worker failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}
