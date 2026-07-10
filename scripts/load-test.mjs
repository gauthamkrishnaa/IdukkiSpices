const target = process.env.LOAD_TEST_URL || "http://127.0.0.1:3000";
const concurrency = Math.max(1, Number(process.env.LOAD_TEST_CONCURRENCY || 20));
const durationMs = Math.max(1000, Number(process.env.LOAD_TEST_DURATION_MS || 10_000));
const paths = ["/", "/api/products", "/about.html", "/shop.html"];
const deadline = Date.now() + durationMs;
const results = [];

async function worker(index) {
  let cursor = index;
  while (Date.now() < deadline) {
    const started = performance.now();
    try {
      const response = await fetch(new URL(paths[cursor % paths.length], target));
      await response.arrayBuffer();
      results.push({ ok: response.ok, status: response.status, ms: performance.now() - started });
    } catch {
      results.push({ ok: false, status: 0, ms: performance.now() - started });
    }
    cursor += concurrency;
  }
}

await Promise.all(Array.from({ length: concurrency }, (_, index) => worker(index)));
const timings = results.map((result) => result.ms).sort((a, b) => a - b);
const percentile = (value) => timings[Math.min(timings.length - 1, Math.floor(timings.length * value))] || 0;
const passed = results.filter((result) => result.ok).length;
const seconds = durationMs / 1000;

console.log(JSON.stringify({
  target,
  concurrency,
  requests: results.length,
  passed,
  failed: results.length - passed,
  requestsPerSecond: Number((results.length / seconds).toFixed(1)),
  latencyMs: { p50: Number(percentile(0.5).toFixed(1)), p95: Number(percentile(0.95).toFixed(1)), p99: Number(percentile(0.99).toFixed(1)) },
  statuses: results.reduce((counts, result) => ({ ...counts, [result.status]: (counts[result.status] || 0) + 1 }), {})
}, null, 2));

if (results.some((result) => !result.ok)) process.exitCode = 1;
