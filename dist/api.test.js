"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const app_1 = __importDefault(require("./app"));
// ─── Setup ────────────────────────────────────────────────────────────────────
const PORT = 3001;
const TOKEN = 'dummy-secret-token-2024';
const BASE = `http://localhost:${PORT}`;
let server;
let api; // authenticated client
let publicApi; // unauthenticated client
let passed = 0;
let failed = 0;
const failures = [];
function assert(label, condition, detail = '') {
    if (condition) {
        console.log(`  ✅  ${label}`);
        passed++;
    }
    else {
        console.log(`  ❌  ${label}${detail ? ' — ' + detail : ''}`);
        failed++;
        failures.push(label);
    }
}
// ─── Helpers ──────────────────────────────────────────────────────────────────
async function safeRequest(fn) {
    try {
        const res = await fn();
        return { status: res.status, body: res.data };
    }
    catch (err) {
        if (axios_1.default.isAxiosError(err) && err.response) {
            return { status: err.response.status, body: err.response.data };
        }
        throw err;
    }
}
// ─── Test runner ──────────────────────────────────────────────────────────────
async function runTests() {
    console.log('\n── Running API tests (axios) ────────────────────────────────\n');
    // ── GET /health (public) ──────────────────────────────────────
    console.log('GET /health');
    const h1 = await safeRequest(() => publicApi.get('/health'));
    assert('returns 200', h1.status === 200);
    assert('success is true', h1.body.success === true);
    assert('status is ok', h1.body.data?.status === 'ok');
    assert('sample_contact present', !!h1.body.data?.sample_contact);
    assert('contacts_loaded > 0', h1.body.data?.contacts_loaded > 0);
    // ── Auth middleware ───────────────────────────────────────────
    console.log('\nAuth middleware');
    const a1 = await safeRequest(() => publicApi.post('/evaluate', {}));
    assert('rejects missing token → 401', a1.status === 401);
    const a2 = await safeRequest(() => publicApi.post('/evaluate', {}, { headers: { Authorization: 'Bearer wrong-token' } }));
    assert('rejects bad token → 403', a2.status === 403);
    const a3 = await safeRequest(() => publicApi.post('/evaluate', {}, { headers: { Authorization: 'NotBearer token' } }));
    assert('rejects malformed header → 401', a3.status === 401);
    // ── POST /evaluate ────────────────────────────────────────────
    console.log('\nPOST /evaluate');
    const e1 = await safeRequest(() => api.post('/evaluate', {
        logic: 'AND',
        conditions: [{ field: 'country', operator: 'country-is', value: 'US' }],
    }));
    assert('returns 200 for valid rule', e1.status === 200);
    const e1Contacts = e1.body.data?.contacts ?? [];
    assert('returns only US contacts', e1Contacts.every(c => c.country === 'US'));
    const e2 = await safeRequest(() => api.post('/evaluate', {
        logic: 'AND',
        conditions: [
            { field: 'purchaseCount', operator: 'count-gt', value: 10 },
            { field: 'plan', operator: 'plan-is', value: 'pro' },
        ],
    }));
    assert('purchaseCount > 10 AND plan-is pro works', e2.status === 200);
    const e2Contacts = e2.body.data?.contacts ?? [];
    assert('all results match conditions', e2Contacts.every(c => c.purchaseCount > 10 && c.plan === 'pro'));
    const e3 = await safeRequest(() => api.post('/evaluate', {
        logic: 'OR',
        conditions: [
            { field: 'signupDate', operator: 'date-before', value: '2021-01-01' },
            { field: 'plan', operator: 'plan-is', value: 'enterprise' },
        ],
    }));
    assert('OR logic with date-before / plan-is works', e3.status === 200);
    const e4 = await safeRequest(() => api.post('/evaluate', {
        conditions: [{ field: 'email', operator: 'email-contains', value: 'acme' }],
    }));
    assert('email-contains operator works', e4.status === 200);
    const e4Contacts = e4.body.data?.contacts ?? [];
    assert('all returned emails contain "acme"', e4Contacts.every(c => c.email.includes('acme')));
    const e5 = await safeRequest(() => api.post('/evaluate', { logic: 'AND', conditions: [] }));
    assert('returns 400 for empty conditions', e5.status === 400);
    assert('returns success:false', e5.body.success === false);
    const e6 = await safeRequest(() => api.post('/evaluate', {
        conditions: [{ field: 'email', operator: 'country-is', value: 'US' }],
    }));
    assert('returns 400 for mismatched field/operator', e6.status === 400);
    // ── POST /rules ───────────────────────────────────────────────
    console.log('\nPOST /rules');
    const s1 = await safeRequest(() => api.post('/rules', {
        name: 'Pro users with 10+ purchases',
        description: 'High-value pro plan contacts',
        rule: {
            logic: 'AND',
            conditions: [
                { field: 'plan', operator: 'plan-is', value: 'pro' },
                { field: 'purchaseCount', operator: 'count-gt', value: 10 },
            ],
        },
    }));
    assert('saves rule → 201', s1.status === 201);
    assert('success is true', s1.body.success === true);
    const savedId = s1.body.data?.saved?.id;
    assert('saved rule has UUID id', !!savedId);
    const s2 = await safeRequest(() => api.post('/rules', { name: 'missing rule' }));
    assert('returns 400 when rule body missing', s2.status === 400);
    const s3 = await safeRequest(() => api.post('/rules', {
        rule: { conditions: [{ field: 'plan', operator: 'plan-is', value: 'free' }] },
    }));
    assert('returns 400 when name missing', s3.status === 400);
    // ── GET /rules ────────────────────────────────────────────────
    console.log('\nGET /rules');
    const g1 = await safeRequest(() => api.get('/rules'));
    assert('returns 200', g1.status === 200);
    assert('success is true', g1.body.success === true);
    const rules = g1.body.data?.rules ?? [];
    assert('rules array contains saved rule', rules.some(r => r.id === savedId));
    // ── DELETE /rules/:id ─────────────────────────────────────────
    console.log('\nDELETE /rules/:id');
    const d1 = await safeRequest(() => api.delete(`/rules/${savedId}`));
    assert('deletes rule → 200', d1.status === 200);
    assert('deleted id matches', d1.body.data?.deleted?.id === savedId);
    const d2 = await safeRequest(() => api.delete(`/rules/${savedId}`));
    assert('returns 404 for gone rule', d2.status === 404);
    const g2 = await safeRequest(() => api.get('/rules'));
    const rulesAfter = g2.body.data?.rules ?? [];
    assert('rule no longer in list', !rulesAfter.some(r => r.id === savedId));
    // ── Summary ───────────────────────────────────────────────────
    console.log(`\n─────────────────────────────────────────────────────────────`);
    console.log(`Results: ${passed} passed, ${failed} failed`);
    if (failures.length)
        console.log(`Failed: ${failures.join(', ')}`);
    console.log('');
    server.close();
    process.exit(failed > 0 ? 1 : 0);
}
// ─── Bootstrap ────────────────────────────────────────────────────────────────
server = app_1.default.listen(PORT, () => {
    api = axios_1.default.create({
        baseURL: BASE,
        headers: { Authorization: `Bearer ${TOKEN}` },
    });
    publicApi = axios_1.default.create({ baseURL: BASE });
    runTests().catch(err => {
        console.error('Unexpected test error:', err);
        server.close();
        process.exit(1);
    });
});
//# sourceMappingURL=api.test.js.map