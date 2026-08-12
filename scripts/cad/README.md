# Inline-four CAD model

This folder contains the source for the engine model. The model is original and uses fixed dimensions.

## Generate

```sh
python3 -m venv .venv
.venv/bin/pip install -r requirements-cad.txt
npm run cad:generate
npm run cad:validate
npm run cad:optimise
```

The scripts write the model to `public/models/inline-four-engine.glb` and the motion data to `lib/generated/inline-four-manifest.json`.

Edit the dimension set in `generate_inline_four.py`, then generate and validate the model again. Do not edit the generated manifest by hand.
