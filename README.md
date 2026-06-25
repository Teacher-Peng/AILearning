# Spelling Bee

A dependency-free browser app for multi-level spelling testing and practice.

## Structure

- `index.html` - app layout and script loading
- `src/styles.css` - mobile-first one-panel visual design
- `src/words.js` - word data grouped by level
- `src/pdf-levels.generated.js` - generated word data extracted from the PDFs
- `src/storage.js` - local score history and missed-word persistence
- `src/speech.js` - browser text-to-speech wrapper
- `src/app.js` - quiz state, rendering, and interactions
- `scripts/extract-pdf-levels.py` - repeatable PDF extraction script

## Run

Open `index.html` directly in a browser, or start a tiny local server:

```bash
python3 -m http.server 5173
```

Then visit `http://localhost:5173/spelling-bee-app/`.

## Regenerate PDF Levels

After replacing or adding PDFs, update `PDF_SOURCES` in `scripts/extract-pdf-levels.py`, then run:

```bash
python3 spelling-bee-app/scripts/extract-pdf-levels.py
```

## Added Features

- Better maintainable file structure
- Dynamic level catalog from PDFs
- Testing or Practice entry flow
- Mobile-first one-panel design
- Quiz length setting
- Auto-play toggle
- Speech speed control
- Practice mode with word search and listening
- Saved last score and missed-word list in `localStorage`
- Retry mode for missed words
