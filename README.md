# Minimal Coding Harness

A deliberately small local harness for running [Pi](https://github.com/earendil-works/pi)
against any OpenAI-compatible coding model. It keeps configuration and secrets local,
limits unnecessary context, and favors small, verifiable changes.

## What it includes

- One local Pi process; no server, daemon, or project dependencies.
- An ignored config file for endpoint, model, workspace, and safety switches.
- A compact coding skill that stops when explicit acceptance criteria pass.
- Deterministic compression of repeated and oversized shell output before model context.
- Local request, token, context, and cost receipts that are never sent back to the model.
- Optional local verification, browser control, and one bounded subagent.
- An explicit private handoff file for continuing unfinished work in a new session.

## Requirements

- Node.js with `process.loadEnvFile` support (Node.js 20.12 or newer).
- Pi coding agent `0.81.1`.
- An OpenAI-compatible API endpoint, model name, and API key.

## Setup

```sh
git clone https://github.com/en-twine/minimal-coding-harness.git
cd minimal-coding-harness
cp harness.config.example.mjs harness.config.mjs
cp .env.example .env
npm install -g --ignore-scripts @earendil-works/pi-coding-agent@0.81.1
```

Put the key in the ignored `.env`:

```dotenv
MINIMAL_API_KEY=replace-me
```

Set `baseUrl`, `model`, and `workspacePath` in the ignored
`harness.config.mjs`, then run:

```sh
node pi.mjs
```

Windows PowerShell:

```powershell
Copy-Item .\harness.config.example.mjs .\harness.config.mjs
Copy-Item .\.env.example .\.env
npm install -g --ignore-scripts @earendil-works/pi-coding-agent@0.81.1
node .\pi.mjs
```

`apiKeyEnv` is the environment-variable name, never the secret itself. A value
explicitly exported in the terminal takes precedence over `.env`.

## Recommended GreenPT profile

This harness was tuned and tested with [GreenPT's OpenAI-compatible endpoint](https://docs.greenpt.ai/get-started)
and `glm-5.2-honey`. It keeps GLM 5.2's coding performance while applying
[GreenPT's Honey output-compression rules](https://docs.greenpt.ai/compression-models)
at the model endpoint.

1. [Create a GreenPT account and choose an API plan](https://account.greenpt.ai/onboarding/plans).
2. [Generate an API key in the dashboard](https://account.greenpt.ai/api/keys).
3. Save the key only in the ignored `.env` as `MINIMAL_API_KEY=...`.
4. Use these values in the ignored `harness.config.mjs`:

```js
baseUrl: "https://api.greenpt.ai/v1",
model: "glm-5.2-honey",
apiKeyEnv: "MINIMAL_API_KEY",
compression: "model",
```

Keep `compression: "model"` for this profile: `glm-5.2-honey` already carries
Honey's model-side rules, so loading the local Honey skill as well would duplicate
instructions. If that variant is unavailable in a supplied model catalog, use
`model: "glm-5.2"` with `compression: "skill"` as the portable fallback. You can
check the models available to your key with GreenPT's documented `GET /v1/models`
endpoint.

## Build in another repository

Keep the harness separate from the application. Point `workspacePath` at the target:

```js
workspacePath: "../my-application",
```

Temporarily override it without editing the config:

```sh
PI_WORKSPACE=/absolute/path/to/my-application node pi.mjs
```

Pi refuses to start when the target directory is missing.

## Configuration

Use `compression: "model"` when the selected model already carries a compact coding
prompt. Use `"skill"` to load the included Honey Lean fallback, or `"none"` to use
neither. The harness refuses to combine the fallback with model IDs containing Honey,
Ponytail, or Caveman.

The fallback is GreenPT's MIT-licensed
[Honey Lean](https://github.com/Green-PT/honey-for-devs/blob/c4e6839cc5217486c3d8fabbcda8bc5443ecb6b0/bench/variants/honey-lean.md)
ruleset. Its license is retained beside the skill.

`verifyCommand` runs an existing local command after Pi settles and reports only
pass/fail without another model request. For example:

```js
verifyCommand: "npm test",
```

Browser control is off by default. It requires
[browser-harness](https://github.com/browser-use/browser-harness) on `PATH`. Delegation
is also off by default and permits only one bounded scout, worker, or reviewer per task.

Temporary environment overrides:

- `PI_WORKSPACE`
- `MINIMAL_BASE_URL`, `MINIMAL_MODEL`, `MINIMAL_API_KEY`
- `PI_HONEY_SKILL`, `PI_BROWSER`, `PI_ORCHESTRATION`, `PI_VERIFY_CMD`
- `PI_MAX_TURNS`, `PI_MAX_SESSION_REQUESTS`, `PI_RESERVE_FINAL_REQUEST`
- `PI_CONTEXT_WARN_TOKENS`, `PI_MAX_CONTEXT_TOKENS`
- `PI_MAX_BASH_OUTPUT_CHARS`, `PI_MAX_OUTPUT_TOKENS`

## Token-efficient workflow

1. Put the requirements and tests in the application repository.
2. Give Pi one vertical slice with exact acceptance criteria and a verification command.
3. Keep routine test and dev-server output in another terminal; send only relevant
   failures into model context.
4. Stop when deterministic checks pass. Use `/new` before unrelated work.
5. Prefer `/new` over compaction. Use `/compact` only when one unfinished item cannot be
   restarted cheaply.
6. Keep browser access and delegation disabled unless a specific acceptance check needs
   them.

The harness warns locally when active context reaches the configured threshold. Parent
request and hard-context caps are disabled by default; behavioral rules control scope.
If a response ends at the output limit, automatic retry is blocked so the model cannot
silently spend another request. Continue with a smaller bounded instruction.

## Handoffs

The `save_handoff` tool is available only for an explicit handoff request. It overwrites
the ignored `.pi-handoff.md` with concise local state and user-only file permissions.
The file is never loaded automatically or shared.

After saving a handoff, use `/new` and then `/pickup`. Delete the local handoff when it is
no longer useful.

## License

The harness is available under the MIT License. The vendored Honey Lean skill retains
its original GreenPT copyright and MIT license.
