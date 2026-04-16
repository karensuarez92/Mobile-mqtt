/**
 * MQTT client configuration.
 *
 * Avoid hardcoding broker URLs, credentials, or topics throughout the app.
 * These values are centralised here and can be overridden at build time via
 * the `process.env.*` values below (for example through a `.env` file or CI
 * secrets), so real credentials never need to be committed to source control.
 */

type MqttConfig = {
  brokerUrl: string;
  topic: string;
  username?: string;
  password?: string;
  /** Maximum payload size (in characters) that the UI will render. */
  maxPayloadChars: number;
};

const DEFAULT_BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt';
const DEFAULT_TOPIC = 'esp32/temperatura';
const DEFAULT_MAX_PAYLOAD_CHARS = 1024;

export const mqttConfig: MqttConfig = {
  brokerUrl: process.env.MQTT_BROKER_URL ?? DEFAULT_BROKER_URL,
  topic: process.env.MQTT_TOPIC ?? DEFAULT_TOPIC,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  maxPayloadChars: DEFAULT_MAX_PAYLOAD_CHARS,
};

/**
 * Validate and sanitise an incoming MQTT payload before it is rendered or
 * forwarded. Returns `null` when the payload should be rejected.
 *
 * - Drops non-string / non-Buffer payloads.
 * - Caps the length to avoid unbounded memory growth if a broker sends a huge
 *   message.
 * - Strips ASCII control characters that are not printable whitespace, which
 *   protects any downstream consumer that might try to render them.
 */
export function sanitizeMqttPayload(
  payload: unknown,
  maxChars: number = mqttConfig.maxPayloadChars,
): string | null {
  let text: string;
  if (typeof payload === 'string') {
    text = payload;
  } else if (payload && typeof (payload as { toString?: () => string }).toString === 'function') {
    text = (payload as { toString: () => string }).toString();
  } else {
    return null;
  }

  // eslint-disable-next-line no-control-regex
  const cleaned = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  if (cleaned.length === 0) {
    return null;
  }
  return cleaned.length > maxChars ? cleaned.slice(0, maxChars) : cleaned;
}
