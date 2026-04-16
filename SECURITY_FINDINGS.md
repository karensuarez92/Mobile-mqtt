# Security Scan — `karensuarez92/Mobile-mqtt`

Scope of the scan: the full repository (React Native app under `MyApp/`).

## Summary

| Category | Status |
| --- | --- |
| Hardcoded API keys / secrets | No real secrets found (see notes) |
| SQL injection | Not applicable — no database / SQL layer |
| Unvalidated user / network input | **Issue found** — fixed |
| Insecure dependencies | **17 vulns, 1 critical, 5 high** — fixed via `npm audit fix` (4 low remaining, see below) |
| Overly permissive CORS | Not applicable — no HTTP server in the repo |
| Exposed debug endpoints | Not applicable — no HTTP server; React Native Metro runs only in dev |
| Missing authentication checks | **Issue found** — MQTT client connected anonymously; now supports credentials via env |

---

## Findings

### 1. Hardcoded MQTT broker URL (Low / informational)
`src/screens/home/Home.tsx` used a hardcoded connection to the public HiveMQ
test broker:

```ts
const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');
client.subscribe('esp32/temperatura', ...);
```

This is not a secret, but:

- Anyone can read/write `esp32/temperatura` on the public broker, so messages
  coming from the broker are untrusted.
- Moving the broker URL / topic into a config file makes it easy to switch to a
  private broker with authentication without touching the screen code.

**Fix:** `src/utils/config/mqttConfig.ts` now holds the broker URL, topic and
(optional) credentials, and reads overrides from `process.env` so a real
deployment can inject a private broker + credentials at build time without
committing them.

### 2. Unvalidated MQTT payload rendered in UI (Medium)
`Home.tsx` called `setMsg(message.toString())` directly on whatever arrived
from the broker and also `console.log`’d it. Because the broker is public,
**any internet user can publish arbitrary bytes** to the subscribed topic.

Risks:
- Unbounded payload size ⇒ memory pressure / UI jank.
- Control characters and non-UTF8 bytes surfaced into logs.
- Future changes that render the string with `dangerouslySetInnerHTML` (web) or
  feed it into a `WebView`/native bridge would become an injection sink.

**Fix:** `sanitizeMqttPayload()` in `src/utils/config/mqttConfig.ts`:
- Enforces `maxPayloadChars = 1024` (truncates longer payloads).
- Rejects non-string / empty payloads.
- Strips ASCII control characters (keeps `\n`, `\r`, `\t`).
- Removed the `console.log` that echoed raw payloads.

### 3. Missing authentication on MQTT connection (Medium)
The app connected anonymously. There is no `username`/`password`, no TLS
certificate pinning, and no access-control on the topic. Anyone on the
internet can spoof messages.

**Fix:**
- `mqtt.connect` now accepts optional `username`/`password` from the env
  (`MQTT_USERNAME`, `MQTT_PASSWORD`).
- `rejectUnauthorized: true` is set explicitly so any future downgrade of TLS
  verification is obvious in the diff.
- For production use, **replace the public HiveMQ broker** with a broker that
  requires authentication, and either pin the server certificate or use a CA
  the client already trusts.

### 4. Vulnerable npm dependencies (Critical / High / Moderate)
`npm audit` before fix:

```
17 vulnerabilities (5 low, 6 moderate, 5 high, 1 critical)
```

Highlights:
- **critical** — `fast-xml-parser` 4.0.0-beta.0 – 4.5.4 (transitive via
  `@react-native-community/cli-platform-android` & `-ios`).
- **high** — `lodash`, `minimatch`, `picomatch`, `flatted`, `sjcl`.
- **moderate** — `ajv`, `bn.js`, `brace-expansion`, `js-yaml`, `qs`, `yaml`.

**Fix:** `npm audit fix` (non-breaking) brings the tree to:

```
4 low severity vulnerabilities
```

All 4 remaining come from `elliptic` → `browserify-sign` / `create-ecdh` pulled
in by **`react-native-crypto`** (itself deprecated). `react-native-crypto` is
loaded transitively by `react-native-polyfill-globals`, which the app needs so
`mqtt.js` works inside React Native. The upstream fix has not been released,
and removing these polyfills breaks the MQTT runtime. **Recommended follow-up:**
drop `react-native-polyfill-globals` / `react-native-crypto` if / when
`mqtt.js` no longer requires them, or migrate to a native MQTT library such as
[`sp-react-native-mqtt`](https://github.com/SudoPlz/sp-react-native-mqtt).

### 5. Debug keystore password in `android/app/build.gradle` (Informational)
The file contains the default React Native debug keystore password
(`android`). This is the public default shipped with every React Native
project and is only used for the `debug` build variant — it is **not a
secret**. A real release keystore must never be committed, which is already
enforced by `.gitignore` (`*.keystore` except `debug.keystore`).

### 6. `android:usesCleartextTraffic` (Informational)
`AndroidManifest.xml` delegates the value to Gradle via
`"${usesCleartextTraffic}"`. The default in the React Native template is
`false` for release and `true` only for the debug variant (needed for Metro).
No change required, but it’s worth verifying that release builds have this
flag set to `false`.

---

## What changed in this PR

- `MyApp/src/utils/config/mqttConfig.ts` — new central MQTT config + payload
  sanitiser.
- `MyApp/src/screens/home/Home.tsx` — uses the config, sanitises incoming
  payloads, drops raw-payload logging, makes TLS verification explicit.
- `MyApp/package-lock.json` — result of `npm audit fix` (no `package.json`
  changes required).
- `SECURITY_FINDINGS.md` — this report.

## What is explicitly NOT changed

- No lint / style / unrelated refactors.
- `package.json` dependency ranges are untouched; only the lockfile was
  updated by `npm audit fix`, which is the safest possible upgrade path.
- `react-native-crypto` / `react-native-polyfill-globals` are kept because
  removing them would break the MQTT runtime. See the follow-up note above.
