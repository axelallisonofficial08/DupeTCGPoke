# DupeTCGPoke — Pokémon TCG Duel WebApp (PWA)

Web-based Pokémon TCG Duel simulator & PWA. Can be played offline or online from modern desktop and mobile browsers (iOS & Android).

## 🚀 Live Demo / Play Online on Smartphone

You can host this directly on **GitHub Pages**:
- Go to repository **Settings** ➔ **Pages**
- Under **Build and deployment** ➔ **Branch**, select `main` branch and `/ (root)` folder, then click **Save**.
- URL: **`https://axelallisonofficial08.github.io/DupeTCGPoke/`**

On your smartphone, you can tap **"Add to Home Screen"** to install it as an offline-capable PWA app.

---

## 🎴 Decks & Features

### Decks
- **Player:** Team Rocket's Honchkrow & Porygon-Z
- **CPU:** Dragapult ex & Drakloak (Tactical AI)
- Also supports: Mega Charizard X ex & Mega Lucario ex

### Core Mechanics & Features
- **PWA & Offline Support:** Precached app shell and assets via Service Worker.
- **Interactive Board:** Full drag & drop or click/tap card targeting for mobile.
- **Three-Tier Ability System:**
  - *Multi-Use*: e.g., Oricorio ex (`Excited Turbo`).
  - *Per-Instance Once*: e.g., Porygon-Z (`Reconstitute`), Drakloak (`Recon Directive`).
  - *Global Named Once*: e.g., Fezandipiti ex (`Flip the Script`), Lunatone (`Lunar Cycle`), Meowth ex (`Last-Ditch Catch`).
- **Bench & Field Inspector:** Cleanly separated view for Pokémon stack/evolution, attached energies, and tool cards for both Player & CPU.
- **Trash / Discard Pile Inspector:** Segregated by Pokémon, Trainer, and Energy cards with quantity grouping and clickable card details.
- **Manual Stadium Activation:** Interactive Stadium zone with activation buttons.

---

## 🛠️ Local Development

```bash
# Run local server
npm start
# Opens at http://127.0.0.1:4173

# Run tests
npm test
```
