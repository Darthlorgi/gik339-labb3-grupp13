// tests/tasks.test.js
// En enda testsvit för Labb 3 (ersätter tidigare uppdelning i api.test.js +
// logic.test.js – ingen praktisk anledning fanns att hålla isär dem, och det
// gav dubbelarbete/dubbla kontroller av samma sak).
//
// Servern startas om FÖR VARJE test (beforeEach/afterEach) så varje test får
// en helt tom tasks-array att jobba mot – inga antaganden om vad tidigare
// tester råkat lämna kvar.
const { spawn } = require('child_process');
const net = require('net');
const request = require('supertest');
const { friendly } = require('./helpers');

function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });
}

async function waitUntilUp(agent, attempts = 20, delayMs = 200) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await agent.get('/tasks');
      if (res.status >= 200 && res.status < 500) return;
    } catch {}
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error('Servern startade inte i tid');
}

let child;
let agent;

async function startServer() {
  const port = await getFreePort();
  const debugServer = !!process.env.DEBUG_SERVER;

  child = spawn(process.execPath, ['server.js'], {
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  if (debugServer) {
    child.stdout.on('data', (d) =>
      process.stdout.write(`\n[server log]: ${d}`)
    );
    child.stderr.on('data', (d) =>
      process.stderr.write(`\n[server log]: ${d}`)
    );
  }
  agent = request(`http://127.0.0.1:${port}`);
  await waitUntilUp(agent);
}

async function stopServer() {
  if (!child) return;
  child.kill();
  await new Promise((r) => setTimeout(r, 150));
}

beforeEach(async () => {
  await startServer();
});
afterEach(async () => {
  await stopServer();
});

// Platt namngivning ("Uppgift N) ...") istället för describe-block: reportern
// använder namnet både för att gruppera (siffran) och som rubrik på
// checkmark-raden (allt efter siffran), så det här ger snyggare rader än
// nästlade describe('Uppgift N')-block gjorde.

test('Uppgift 1) Initiera express', async () => {
  const res = await agent.get('/tasks');
  friendly(
    'Servern ska svara på GET /tasks utan att krascha.',
    () => {
      expect(res.status).toBeGreaterThanOrEqual(200);
      expect(res.status).toBeLessThan(500);
    },
    { detail: false }
  );
});

test('Uppgift 2) GET /tasks', async () => {
  const res = await agent.get('/tasks');
  friendly(
    'GET /tasks ska svara med statuskod 200 och en array (JSON).',
    () => {
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/json/i);
      expect(Array.isArray(res.body)).toBe(true);
    },
    { detail: false }
  );
});

test('Uppgift 3) POST /tasks', async () => {
  const res = await agent
    .post('/tasks')
    .set('Content-Type', 'application/json')
    .send({ title: 'Unik titel för test', dueDate: '2026-12-24' });

  friendly(
    'POST /tasks ska svara med statuskod 201 och ett svar som innehåller ett id, när en task skapas.',
    () => {
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
    }
  );

  friendly(
    'title i svaret ska vara samma som skickades in, inte en hårdkodad text.',
    () => {
      expect(res.body.title).toBe('Unik titel för test');
    },
    { detail: false }
  );

  friendly(
    'dueDate i svaret ska vara samma som skickades in, inte en hårdkodad text.',
    () => {
      expect(res.body.dueDate).toBe('2026-12-24');
    },
    { detail: false }
  );

  const badRes = await agent
    .post('/tasks')
    .set('Content-Type', 'application/json')
    .send({});
  friendly(
    'POST /tasks utan title i body ska ge 422 (ogiltig indata), inte lyckas som vanligt.',
    () => {
      expect(badRes.status).toBe(422);
    }
  );
});

// Namnges medvetet UTAN ")" direkt efter siffran, så den grupperas under
// samma "Uppgift 3" men inte konkurrerar med testet ovan om checkmark-radens
// rubriktext.
test('Uppgift 3 – Alla tasks har done: false', async () => {
  const res = await agent
    .post('/tasks')
    .set('Content-Type', 'application/json')
    .send({ title: 'Test' });
  friendly('En nyskapad task ska ha done: false som startvärde.', () => {
    expect(res.body.done).toBe(false);
  });
});

test('Uppgift 4) GET /tasks/:id', async () => {
  const resA = await agent
    .post('/tasks')
    .set('Content-Type', 'application/json')
    .send({ title: 'Task A' });
  const taskA = resA.body;

  const resB = await agent
    .post('/tasks')
    .set('Content-Type', 'application/json')
    .send({ title: 'Task B' });
  const taskB = resB.body;

  const getRes = await agent.get(`/tasks/${taskB.id}`);

  friendly(
    'GET /tasks/:id ska returnera just den task som efterfrågades, inte t.ex. den första i listan.',
    () => {
      expect(getRes.body.id).toBe(taskB.id);
      expect(getRes.body.title).toBe('Task B');
      expect(getRes.body.title).not.toBe('Task A');
    },
    { detail: false }
  );

  friendly(
    'GET /tasks/:id ska svara med statuskod 200 när en task hittas.',
    () => {
      expect(getRes.status).toBe(200);
    }
  );

  const notFoundRes = await agent.get(`/tasks/does-not-exist-${Date.now()}`);
  friendly(
    'GET /tasks/:id med ett id som inte finns ska ge 404, inte en vanlig 200:a.',
    () => {
      expect(notFoundRes.status).toBe(404);
    }
  );
});
