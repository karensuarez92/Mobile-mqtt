/**
 * Centralized MQTT broker configuration and topic constants so URLs and topic
 * strings aren't duplicated across components.
 */
export const MQTT_BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt';

export const MQTT_TOPICS = {
  temperature: 'esp32/temperatura',
} as const;

export type MqttTopic = (typeof MQTT_TOPICS)[keyof typeof MQTT_TOPICS];
