import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NodeSDK } from '@opentelemetry/sdk-node';

// Initialize the OpenTelemetry Node SDK
const sdk = new NodeSDK({
  instrumentations: [new HttpInstrumentation()],
});

if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
  try {
    sdk.start();
    console.log('OpenTelemetry SDK started successfully.');
  } catch (error) {
    console.error('Failed to start OpenTelemetry SDK:', error);
  }

  // Graceful shutdown on termination
  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => console.log('OpenTelemetry SDK terminated.'))
      .catch((error) => console.error('Error terminating OpenTelemetry SDK:', error))
      .finally(() => process.exit(0));
  });
} else {
  console.log('OpenTelemetry SDK not started (OTEL_EXPORTER_OTLP_ENDPOINT is not configured).');
}
