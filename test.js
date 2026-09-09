// node test.js — checks the musical logic, the part that fails silently by
// going out of tune instead of throwing.
const assert = require("assert");
const fs = require("fs");

// the app ships as one file, so pull the pure-logic block out of the page
// rather than making the page depend on a second file it may not find.
const src = fs.readFileSync(__dirname + "/index.html", "utf8");
const a = src.indexOf("// >>> MUSIC"), b = src.indexOf("// <<< MUSIC");
if (a < 0 || b < 0) throw new Error("MUSIC markers missing from index.html");
const { mulberry32, SCALES, SCALE_NAMES, mtof, euclid, melody, noteFor } =
  new Function(src.slice(a, b) +
    "return {mulberry32,SCALES,SCALE_NAMES,mtof,euclid,melody,noteFor};")();

let n = 0;
const test = (name, fn) => { fn(); n++; console.log("  ok  " + name); };

test("prng is deterministic and in range", () => {
  const a = mulberry32(42), b = mulberry32(42);
  for (let i = 0; i < 1000; i++) {
    const v = a();
    assert.strictEqual(v, b(), "same seed must replay exactly");
    assert.ok(v >= 0 && v < 1, "out of range: " + v);
  }
  assert.notStrictEqual(mulberry32(42)(), mulberry32(43)(), "different seeds must differ");
});

test("every scale is 12-tone legal, sorted and duplicate-free", () => {
  assert.strictEqual(SCALE_NAMES.length, 20, "the hardware advertises 20 scales");
  for (const name of SCALE_NAMES) {
    const d = SCALES[name];
    assert.ok(d.length >= 5, name + " is too short");
    assert.strictEqual(d[0], 0, name + " must start on the tonic");
    d.forEach((x, i) => {
      assert.ok(x >= 0 && x < 12, name + " degree out of octave: " + x);
      if (i) assert.ok(x > d[i - 1], name + " degrees must ascend");
    });
  }
});

test("euclid places exactly the requested pulses", () => {
  for (let steps = 2; steps <= 16; steps++)
    for (let pulses = 1; pulses <= steps; pulses++)
      for (const rot of [0, 1, 5]) {
        const p = euclid(steps, pulses, rot);
        assert.strictEqual(p.length, steps);
        assert.strictEqual(p.reduce((a, b) => a + b, 0), pulses,
          `E(${pulses},${steps}) rot ${rot} -> ${p.join("")}`);
      }
});

test("euclid rotation is a rotation, not a reshuffle", () => {
  const base = euclid(16, 5, 0);
  const rot = euclid(16, 5, 3);
  assert.deepStrictEqual(rot, base.map((_, i) => base[(i + 3) % 16]));
});

test("euclid spreads pulses instead of clumping them", () => {
  const p = euclid(16, 4, 0);                       // must be four on the floor
  assert.deepStrictEqual(p, [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]);
});

test("noteFor stays in the scale and rises with the index", () => {
  for (const name of SCALE_NAMES) {
    const d = SCALES[name];
    let prev = -Infinity;
    for (let i = 0; i < d.length * 3; i++) {
      const m = noteFor(d, i, 4, 0);
      assert.ok(m > prev, name + " must ascend at index " + i);
      prev = m;
      assert.ok(d.includes(((m % 12) + 12) % 12), name + " left its own scale at " + m);
    }
  }
});

test("noteFor transposes by tonic and by octave", () => {
  const d = SCALES.major;
  assert.strictEqual(noteFor(d, 0, 4, 0), 48);
  assert.strictEqual(noteFor(d, 0, 4, 7) - noteFor(d, 0, 4, 0), 7, "tonic shifts the whole scale");
  assert.strictEqual(noteFor(d, 0, 5, 0) - noteFor(d, 0, 4, 0), 12, "one octave per oct step");
  assert.strictEqual(noteFor(d, d.length, 4, 0) - noteFor(d, 0, 4, 0), 12, "wrapping adds an octave");
});

test("melody fills the pattern and stays inside two octaves", () => {
  for (const role of ["lead", "harmony", "bass", "perc"])
    for (let seed = 0; seed < 200; seed++) {
      const nDeg = SCALES[SCALE_NAMES[seed % 20]].length;
      const m = melody(mulberry32(seed), 16, role, nDeg);
      assert.strictEqual(m.length, 16, role + " must fill every step");
      m.forEach(v => {
        assert.ok(Number.isInteger(v) && v >= 0 && v <= nDeg * 2,
          `${role} seed ${seed}: index ${v} out of range`);
      });
    }
});

test("melody repeats a cell instead of being white noise", () => {
  // a tiled motif must reuse pitches; random-per-step would not
  let reused = 0;
  for (let seed = 0; seed < 200; seed++) {
    const m = melody(mulberry32(seed), 16, "lead", 7);
    if (new Set(m).size < 10) reused++;
  }
  assert.ok(reused > 180, "expected motif repetition, got " + reused + "/200");
});

test("bass is never a single repeated note", () => {
  for (let seed = 0; seed < 500; seed++) {
    const m = melody(mulberry32(seed), 16, "bass", 7);
    assert.ok(new Set(m).size > 1, "one-note bass at seed " + seed);
  }
});

test("mtof matches concert pitch", () => {
  assert.strictEqual(mtof(69), 440);
  assert.ok(Math.abs(mtof(60) - 261.626) < .001, "middle C");
  assert.ok(Math.abs(mtof(81) / mtof(69) - 2) < 1e-9, "an octave doubles");
});

console.log("\n" + n + " passed");
