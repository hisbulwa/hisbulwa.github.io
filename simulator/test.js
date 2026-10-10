import assert from 'node:assert';
import fs from 'node:fs';
import vm from 'node:vm';
import { bobotButir, hitungIPotik, tentukanZona, hitungSkorButir, saranPerbaikan } from './data/ipotik-engine.js';

const config = JSON.parse(fs.readFileSync('./data/ipotik-config.json', 'utf8'));

// Test 1: Empty answers -> 0, Zona Merah
const emptyRes = hitungIPotik(config, {});
assert.strictEqual(emptyRes.ipotik, 0);
assert.strictEqual(emptyRes.zona.zona, 'merah');
assert.strictEqual(emptyRes.butirTerisi, 0);

// Test 2: Max answers -> 4.0, Zona Hijau
const maxAnswers = {};
config.butir.forEach((b) => {
  if (b.tipeInput === 'checklist') maxAnswers[b.no] = { input: b.checklistItems.length };
  else if (b.tipeInput === 'lampiran3') maxAnswers[b.no] = { input: 100, targetPeriode: 'Harian' };
  else if (b.tipeInput === 'jumlah_plus1') maxAnswers[b.no] = { input: 3 };
  else maxAnswers[b.no] = { input: 4 };
});
const maxRes1 = hitungIPotik(config, maxAnswers, 1);
assert.strictEqual(maxRes1.ipotik, 4);
assert.strictEqual(maxRes1.zona.zona, 'hijau');
assert.strictEqual(maxRes1.butirTerisi, 33);

const maxRes2 = hitungIPotik(config, maxAnswers, 2);
assert.strictEqual(maxRes2.ipotik, 4);
assert.strictEqual(maxRes2.zona.zona, 'hijau');

// Test 3: Method 3 uses printed weights, with its own zone thresholds
const kegiatanUtama = config.aspek.find(a => a.id === 'kegiatan_utama');
assert.strictEqual(bobotButir(config.butir.find(b => b.no === '17'), kegiatanUtama, 3), 0.03);
assert.strictEqual(bobotButir(config.butir.find(b => b.no === '19B'), kegiatanUtama, 3), 1 / 60);
assert.strictEqual(hitungIPotik(config, maxAnswers).metode, 3);
assert.strictEqual(tentukanZona(2.66, 3).zona, 'kuning');
assert.strictEqual(tentukanZona(2.6601, 3).zona, 'hijau');
assert.strictEqual(tentukanZona(1.33, 3).zona, 'merah');
assert.strictEqual(tentukanZona(1.3301, 3).zona, 'kuning');

// Test 4: Lampiran 3 lookup
const b19B = config.butir.find(b => b.no === '19B');
assert.strictEqual(hitungSkorButir(b19B, 0, 'Bulanan'), 1);
assert.strictEqual(hitungSkorButir(b19B, 20, 'Bulanan'), 2.2);
assert.strictEqual(hitungSkorButir(b19B, 40, 'Bulanan'), 2.4);
assert.strictEqual(hitungSkorButir(b19B, 60, 'Bulanan'), 2.5);

// Test 5: Methods 1 and 2 zone thresholds
assert.strictEqual(tentukanZona(4.0).zona, 'hijau');
assert.strictEqual(tentukanZona(2.67).zona, 'hijau');
assert.strictEqual(tentukanZona(2.66).zona, 'kuning');
assert.strictEqual(tentukanZona(1.34).zona, 'kuning');
assert.strictEqual(tentukanZona(1.33).zona, 'merah');
assert.strictEqual(tentukanZona(0.0).zona, 'merah');

// Test 6: Recommendations identify actionable checklist gaps and rank by score uplift
const recommendationAnswers = {
  '1': { input: 2, items: [0, 1] },
  '2': { input: 3 }
};
const recommendationResult = hitungIPotik(config, recommendationAnswers);
const recommendations = saranPerbaikan(config, recommendationResult, recommendationAnswers);
const checklistAdvice = recommendations.find(item => item.no === '1');
const rpkAdvice = recommendations.find(item => item.no === '2');
assert.ok(checklistAdvice.saran.includes('SK Tim Pojok Statistik BPS'));
assert.ok(checklistAdvice.kenaikanIPotik > 0);
assert.ok(rpkAdvice.saran.includes('skor 4'));
assert.ok(recommendations.every((item, index) =>
  index === 0 || recommendations[index - 1].kenaikanIPotik >= item.kenaikanIPotik
));

// Test 7: Embedded offline engine initializes and exposes the same recommendations
const html = fs.readFileSync('./index.html', 'utf8');
const fallbackScript = html.match(/<script>\s*\/\/ Inlined engine fallback[\s\S]*?<\/script>/)[0]
  .replace(/^<script>|<\/script>$/g, '');
const sandbox = { window: {} };
vm.runInNewContext(fallbackScript, sandbox);
const fallbackEngine = sandbox.window.__IPOTIK_FALLBACK_ENGINE__;
assert.strictEqual(typeof fallbackEngine.hitungIPotik, 'function');
assert.strictEqual(typeof fallbackEngine.saranPerbaikan, 'function');
assert.deepStrictEqual(
  JSON.parse(JSON.stringify(fallbackEngine.saranPerbaikan(
    config,
    fallbackEngine.hitungIPotik(config, recommendationAnswers),
    recommendationAnswers
  ))),
  recommendations
);

console.log('Semua test scoring engine lulus!');
