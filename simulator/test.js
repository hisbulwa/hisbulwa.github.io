import assert from 'node:assert';
import fs from 'node:fs';
import { hitungIPotik, tentukanZona, hitungSkorButir } from './data/ipotik-engine.js';

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

// Test 3: Lampiran 3 lookup
const b19B = config.butir.find(b => b.no === '19B');
assert.strictEqual(hitungSkorButir(b19B, 0, 'Bulanan'), 1);
assert.strictEqual(hitungSkorButir(b19B, 20, 'Bulanan'), 2.2);
assert.strictEqual(hitungSkorButir(b19B, 40, 'Bulanan'), 2.4);
assert.strictEqual(hitungSkorButir(b19B, 60, 'Bulanan'), 2.5);

// Test 4: Zona thresholds
assert.strictEqual(tentukanZona(4.0).zona, 'hijau');
assert.strictEqual(tentukanZona(2.67).zona, 'hijau');
assert.strictEqual(tentukanZona(2.66).zona, 'kuning');
assert.strictEqual(tentukanZona(1.34).zona, 'kuning');
assert.strictEqual(tentukanZona(1.33).zona, 'merah');
assert.strictEqual(tentukanZona(0.0).zona, 'merah');

console.log('Semua test scoring engine lulus!');
