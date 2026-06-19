import { task } from '@trigger.dev/sdk/v3';

export interface ExampleJobPayload {
  email: string;
  name: string;
}

/**
 * Example Trigger.dev background task.
 * Simulates a long-running process (like sending an email or syncing data).
 */
export const exampleJob = task({
  id: 'example-job',
  run: async (payload: ExampleJobPayload) => {
    console.log(`Starting background job simulation for ${payload.name}...`);

    // Simulate work (e.g., waiting 2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log(`Successfully completed background job for ${payload.email}`);

    return {
      status: 'success',
      message: `Simulated task successfully completed for ${payload.name}`,
      timestamp: new Date().toISOString(),
    };
  },
});
