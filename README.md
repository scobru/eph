# EPH — ephemeral synth

One button. 4 294 967 296 ideas. Press it and a patch is born; press again and
it is gone forever.

**[Play it →](https://scobru.github.io/eph/)**

A software instrument in the spirit of a hardware random synth: you do not
design a sound, you press a button and listen to what arrives. Every parameter
across every voice is drawn from a single 32-bit seed.

One HTML file, no dependencies, no build step. Open `index.html` and it runs.

## What a press gives you

- **4 tracks with roles** — lead, bass, harmony, percussion — each with its own
  register, rhythmic job and engine pool, so the voices arrange themselves
  instead of piling into the same octave.
- **8 synthesis engines** — subtractive, FM, acid, noise, speech (formant),
  Karplus-Strong, supersaw, additive. Never the same engine twice in one patch.
- **4 euclidean sequences**, independent step counts and divisions, so the
  patterns drift against each other.
- **20 scales**, from major to hirajoshi to persian. The tonic survives a press.
- **Motif-based melodies** — a short cell, tiled and varied. Random notes per
  step sound like a machine; a repeated cell sounds like a part.
- **Per-track effects** from the seed: drive/wavefolder, bitcrush, ring
  modulation, comb, filter wobble, tremolo/stutter gate.
- **Per-track filter** (type, cutoff, resonance) plus reverb and tempo-synced
  delay sends.
- **Swing, humanised timing, pitch drift** and velocity-driven brightness.

## Playing it

| | |
|---|---|
| `space` | new patch |
| `←` `→` | step through the last 20 patches |
| `1`–`4` | mute a track |
| `r` | start/stop recording |

Master **filter** and **res** are the performance controls. Every track has its
own volume, reverb, delay and filter sliders. Paste a seed and press *load* to
recall an exact patch.

**Recording** captures the master output as a 16-bit/48k WAV — including patch
changes and fader moves while it runs, so it records the performance, not the
patch.

## MIDI

Connect any controller (Web MIDI, so Chrome or Edge).

| Channel | What it does |
|---|---|
| 1 | notes set the tonic · CC7 volume · CC91 reverb · CC9 scale · CC74 filter · CC71 resonance |
| 2–5 | take over track 1–4; its sequence stops, the others keep running |
| 6–9 | play track 1–4 solo; all sequences stop |

Notes sustain until note-off, so held chords work.

## Tests

```bash
node test.js
```

Checks the musical logic — the part that fails silently by going out of tune
instead of throwing: euclidean pulse counts, scale legality, degree-to-MIDI
conversion, motif repetition, PRNG determinism. It reads the logic straight out
of `index.html`, so the app stays a single file.

## Credits

Built by [scobru](https://github.com/scobru). Inspired by the idea behind
[cyma forma's RND synth](https://www.cymaforma.com/rnd-synth) — this is an
independent software instrument, not affiliated with it.
