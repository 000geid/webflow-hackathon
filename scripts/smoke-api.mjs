import assert from 'node:assert/strict';
const base = process.env.API_BASE_URL ?? 'http://localhost:3000';
async function call(path, body, token) {
  const response = await fetch(base + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  assert.match(response.headers.get('content-type') ?? '', /application\/json/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  return { status: response.status, data: await response.json() };
}
const created = await call('/api/games', { mode: 'fixture' });
assert.equal(created.status, 201, JSON.stringify(created.data));
const { gameId, token } = created.data;
const path = `/api/games/${gameId}`;
const action = (body) => call(`${path}/actions`, body, token);
assert.equal(created.data.status, 'ready');
assert.equal(JSON.stringify(created.data).includes('correctChoiceId'), false);
assert.equal((await call(path)).status, 401);
assert.equal((await call(path, undefined, '0'.repeat(72))).status, 404);
assert.equal((await action({ type: 'start', roundIndex: -1 })).status, 400);
assert.equal((await action({ type: 'start', roundIndex: 0, score: 9999 })).status, 400);
assert.equal((await action({ type: 'start', roundIndex: 1 })).status, 409);
for (let i = 0; i < 5; i++) {
  assert.equal((await action({ type: 'start', roundIndex: i })).data.status, 'revealing');
  assert.equal((await action({ type: 'answer', roundIndex: i, choiceId: 'A' })).status, 409);
  const pauses = await Promise.all([action({ type: 'pause', roundIndex: i }), action({ type: 'pause', roundIndex: i })]);
  for (const result of pauses) assert.equal(result.data.status, 'paused');
  assert.equal(pauses[0].data.round.elapsedMs, pauses[1].data.round.elapsedMs);
  assert.equal(pauses[0].data.round.choices.length, 4);
  assert.equal(pauses[0].data.round.result, null);
  const answered = await action({ type: 'answer', roundIndex: i, choiceId: 'A' });
  assert.equal(answered.status, 200);
  const repeated = await action({ type: 'answer', roundIndex: i, choiceId: 'A' });
  assert.equal(repeated.data.score, answered.data.score);
  assert.equal((await action({ type: 'answer', roundIndex: i, choiceId: 'B' })).status, 409);
}
const final = await call(path, undefined, token);
assert.equal(final.data.status, 'finished');
assert.ok(final.data.score > 0 && final.data.score <= 5000);
assert.equal('token' in final.data, false);
console.log('PASS: partida completa, persistencia entre requests, auth, validación, pausas concurrentes y reintentos.');
const race = await call('/api/games', { mode: 'fixture' });
const racePath = `/api/games/${race.data.gameId}`;
const raceAction = (body) => call(`${racePath}/actions`, body, race.data.token);
await raceAction({ type: 'start', roundIndex: 0 });
await raceAction({ type: 'pause', roundIndex: 0 });
const results = await Promise.all(['A', 'B'].map(choiceId => raceAction({ type: 'answer', roundIndex: 0, choiceId })));
assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
console.log('PASS: dos respuestas simultáneas no sobrescriben el resultado.');
const expiring = await call('/api/games', { mode: 'fixture' });
const expPath = `/api/games/${expiring.data.gameId}`;
await call(`${expPath}/actions`, { type: 'start', roundIndex: 0 }, expiring.data.token);
await new Promise(resolve => setTimeout(resolve, 15100));
const expired = await call(expPath, undefined, expiring.data.token);
assert.equal(expired.data.status, 'answered');
assert.deepEqual(expired.data.round.result, { choiceId: null, points: 0, correctChoiceId: 'A' });
assert.equal((await call(expPath, undefined, expiring.data.token)).data.status, 'answered');
console.log('PASS: consultar una ronda vencida persiste la expiración.');
