# Timple Tuner PWA — Full Implementation Plan

This document is a step-by-step, fine-grained implementation plan for a **React + Vite PWA** timple tuner. It’s designed so another AI can implement it directly, with each task including **acceptance criteria** suitable for automated tests (Vitest + React Testing Library). The UI is a **single column** optimized for phones.

**Technology constraints:**
- React + Vite (no Next.js)
- TypeScript (recommended, but not strictly required)
- Free UI library (e.g., Mantine)
- Vitest for tests
- No backend; strictly a client-side PWA
- Instrument: **timple only**, 5 strings

---

## Overall UI Layout (Single Column)

Vertical order (top → bottom):

1. **Header** – App title, subtitle, language toggle (EN/ES).
2. **Tuning Panel** – Selected string info, target note/frequency, live reading, visual indicator, start/stop button.
3. **String Selection** – The 5 strings displayed vertically, one per row, with exactly one selected at a time.
4. **Banner Ad Area** – Fixed at the bottom of the main content (above any OS/browser UI), clearly tappable.
5. **Status Panel** – Mic permission status, noise/signal quality info, offline status, noise configuration summary.

Simple wireframe:

```
+----------------------------------------------------+
| HEADER                                             |
|  Timple Tuner       [ EN | ES ]                    |
|  Tune all 5 strings of your timple                 |
+----------------------------------------------------+
| TUNING PANEL                                       |
|  Selected: String 1 (G)                            |
|  Target: G4 – 392 Hz                               |
|  Current:  —                                       |
|  Status: Waiting for signal                        |
|  [ visual needle / bar ]                           |
|  [ Start tuning ]                                  |
+----------------------------------------------------+
| STRING SELECTION (vertical list)                   |
|  ● String 1 (G)   (selected, highlighted)          |
|    String 2 (C)                                    |
|    String 3 (E)                                    |
|    String 4 (A)                                    |
|    String 5 (D)                                    |
+----------------------------------------------------+
| BANNER AD AREA                                     |
|  [          Ad banner placeholder           ]      |
+----------------------------------------------------+
| STATUS PANEL                                       |
|  Mic: Granted | Signal: Good | Online              |
|  Noise: Volume thr 0.1, Confidence thr 0.7         |
+----------------------------------------------------+
```

---

## Phase 0 – Project Skeleton & Tooling

### 0.1 Create Vite React project
**Task**
- Scaffold a new Vite React app (TypeScript template).
- Configure basic scripts (`dev`, `build`, `test`).

**Acceptance Criteria**
- Running `npm test` (or `pnpm test`, etc.) executes Vitest successfully.
- A trivial test (e.g., `expect(1 + 1).toBe(2)`) passes.

---

### 0.2 Install UI and testing libraries
**Task**
- Install Mantine core + Mantine hooks.
- Install React Testing Library and required peers.

**Acceptance Criteria**
- A test file can import a Mantine component (e.g. `Button`) and render it with Testing Library:
  - `render(<Button>Click</Button>)` does not throw.
  - `screen.getByText('Click')` finds the button.

---

### 0.3 Configure Vitest + Testing Library
**Task**
- Create/update `vitest.config.ts` with:
  - `test.environment = 'jsdom'`.
  - Appropriate React plugin.
- Add a test setup file (e.g. `setupTests.ts`) for Testing Library utilities if needed.

**Acceptance Criteria**
- A test renders `<App />` and asserts that some base text (e.g. `Timple Tuner`) is present.
- Tests run in jsdom (e.g. a test can assert `typeof window !== 'undefined'`).

---

## Phase 1 – High-level UI Shell (Single Column)

### 1.1 Create App shell layout
**Task**
- Use Mantine layout components (e.g. `AppShell` or a `Stack`/`Container`) to create a single-column layout with 5 vertical sections in order:
  1. Header
  2. Tuning Panel
  3. String Selection
  4. Banner Ad Area
  5. Status Panel

**Acceptance Criteria**
- A test renders `<App />` and finds 5 containers by data-testid:
  - `header-section`
  - `tuning-panel-section`
  - `string-selection-section`
  - `banner-ad-section`
  - `status-panel-section`
- The DOM order of these elements matches the specified order.

---

### 1.2 Add app title and subtitle to Header
**Task**
- In the header section, display:
  - Title: “Timple Tuner”.
  - Subtitle: “Tune all 5 strings of your timple”.

**Acceptance Criteria**
- A test renders `<App />` and asserts:
  - `screen.getByText('Timple Tuner')` is present.
  - `screen.getByText('Tune all 5 strings of your timple')` is present.

---

## Phase 2 – Domain Model & State (Timple-specific)

### 2.1 Define timple tuning constants
**Task**
- Create `tuning.ts` (or similar) that exports a constant array with exactly 5 entries, each like:
  ```ts
  interface TimpleString {
    id: string;        // e.g. 'string-1'
    label: string;     // e.g. 'String 1 (G)'
    note: string;      // e.g. 'G4'
    frequencyHz: number;
  }
  ```

**Acceptance Criteria**
- A pure unit test imports the array and asserts:
  - Its length is exactly 5.
  - Each item has `id`, `label`, `note`, and `frequencyHz` defined.
  - All `frequencyHz` values are numbers > 0.

---

### 2.2 `useSelectedString` state hook
**Task**
- Implement `useSelectedString` hook:
  - Holds the `selectedStringId`.
  - Initializes to the first string in the tuning array.
  - Provides `selectedString` (the full object) and `setSelectedString(id: string)`.

**Acceptance Criteria**
- A hook test using `renderHook`:
  - On initial render, `selectedString.id` equals the first tuning entry’s id.
  - After calling `setSelectedString` with another valid id, `selectedString.id` updates.
  - Calling `setSelectedString` with an invalid id does not crash and leaves `selectedStringId` unchanged (or follows the defined behavior).

---

### 2.3 `<StringSelection />` component (static)
**Task**
- Create `<StringSelection />` representing the **string selection section UI**:
  - Renders the 5 strings vertically (one per row).
  - Uses the tuning constant as its data source.
  - Does **not** yet handle selection logic, only display.

**Acceptance Criteria**
- A test renders `<StringSelection />` and asserts:
  - Exactly 5 rows are present (e.g. using `getAllByTestId('string-row')`).
  - The labels match the labels from the tuning constant.

---

### 2.4 Add selection behavior to `<StringSelection />`
**Task**
- Update `<StringSelection />` to:
  - Accept `selectedStringId: string` and `onSelectString(id: string)` as props.
  - Highlight the row whose id equals `selectedStringId` (e.g. via `aria-selected="true"` or a CSS class).
  - Call `onSelectString(id)` when a row is clicked/tapped.

**Acceptance Criteria**
- A test renders `<StringSelection />` with a mock `onSelectString` and a given `selectedStringId`:
  - The matching row has `aria-selected="true"` (or equivalent testable marker).
  - All other rows do **not** have that marker.
  - Clicking an unselected row calls `onSelectString` with its id and does not call it for any other row.

---

### 2.5 Integrate selection into `<App />`
**Task**
- In `<App />`, use `useSelectedString` and pass its values to `<StringSelection />` so that clicking a string updates the selection.

**Acceptance Criteria**
- A test renders `<App />`:
  - Initially, the first string row is highlighted.
  - After clicking a different string row, that row becomes highlighted and the previous one is no longer highlighted.

---

## Phase 3 – Tuning Panel (UI-first, Mocked Data)

### 3.1 `<TuningPanel />` skeleton
**Task**
- Create `<TuningPanel />` representing the tuning panel section:
  - Accepts a `selectedString` prop.
  - Shows selected string label.
  - Shows target note and frequency.
  - Shows a placeholder current frequency and status (e.g., “—” and “Awaiting input…”).

**Acceptance Criteria**
- A test renders `<TuningPanel />` with a fake `selectedString` and asserts:
  - The label (e.g. `String 1 (G)`) is displayed.
  - The note and frequency text (e.g. `G4`, `392 Hz`) are displayed.
  - Placeholder current frequency (e.g. `—`) and status text (e.g. `Awaiting input`) are present.

---

### 3.2 Display selected string from App in Tuning Panel
**Task**
- In `<App />`, pass `selectedString` from `useSelectedString` into `<TuningPanel />` so it stays in sync with user selection.

**Acceptance Criteria**
- A test renders `<App />`:
  - Initially, `<TuningPanel />` shows the first string’s label.
  - After clicking a different string in `<StringSelection />`, `<TuningPanel />` updates to show the new string’s label.

---

### 3.3 Define tuning status model
**Task**
- Define types:
  ```ts
  type TuningStatus = 'awaiting' | 'in_tune' | 'sharp' | 'flat' | 'noisy';

  interface TuningReading {
    frequencyHz: number | null;
    centsOff: number | null;
    status: TuningStatus;
    confidence: number; // range 0–1
    volume: number;     // range 0–1 (approximate, later)
  }
  ```

**Acceptance Criteria**
- A pure TypeScript unit test (or runtime type checks) verifies:
  - A sample `TuningReading` object with each possible `status` compiles and has numeric `confidence` and `volume`.
  - `confidence` and `volume` in tests are asserted to be within [0, 1].

---

### 3.4 Render `TuningReading` in `<TuningPanel />`
**Task**
- Update `<TuningPanel />` to accept a `reading: TuningReading` prop and render:
  - Current frequency or `—` when null.
  - Status text based on `status` value.

**Acceptance Criteria**
- Tests render `<TuningPanel />` with different `reading` values:
  - `status: 'awaiting'` → shows text like “Awaiting input”.
  - `status: 'in_tune'` → shows text like “In tune”.
  - `status: 'sharp'` → shows “Too sharp”.
  - `status: 'flat'` → shows “Too flat”.
  - `status: 'noisy'` → shows “Too noisy” (or similar).
  - When `frequencyHz` is null, current frequency displays `—`.

---

### 3.5 Visual indicator (needle / bar)
**Task**
- Add a visual indicator (e.g. a horizontal bar or pseudo-needle):
  - Center at `centsOff = 0`.
  - “Flat” region for `centsOff < 0`.
  - “Sharp” region for `centsOff > 0`.
- Expose states via testable attributes, e.g. `data-tuning-position="flat|center|sharp"`.

**Acceptance Criteria**
- Tests render `<TuningPanel />` with different `centsOff`:
  - `centsOff = 0` → `data-tuning-position="center"`.
  - Negative `centsOff` → `data-tuning-position="flat"`.
  - Positive `centsOff` → `data-tuning-position="sharp"`.

---

## Phase 4 – Status Panel & Noise Config (UI)

### 4.1 `<StatusPanel />` skeleton
**Task**
- Create `<StatusPanel />` (bottom section) showing:
  - Mic permission status placeholder.
  - Noise handling summary placeholder.
  - Online/offline status placeholder.

**Acceptance Criteria**
- A test renders `<StatusPanel />` with props:
  - `micStatus: 'unknown'`, `'granted'`, `'denied'`.
  - Asserts that correct labels like “Mic: Not requested”, “Mic: Granted”, “Mic: Denied” appear.

---

### 4.2 Noise handling configuration model
**Task**
- Define:
  ```ts
  interface NoiseHandlingConfig {
    minVolumeThreshold: number;      // 0–1
    minConfidenceThreshold: number;  // 0–1
  }

  const defaultNoiseHandlingConfig: NoiseHandlingConfig = {
    minVolumeThreshold: 0.1,
    minConfidenceThreshold: 0.7,
  };
  ```

**Acceptance Criteria**
- A unit test asserts:
  - `defaultNoiseHandlingConfig.minVolumeThreshold` is between 0 and 1.
  - `defaultNoiseHandlingConfig.minConfidenceThreshold` is between 0 and 1.

---

### 4.3 Display noise config in StatusPanel
**Task**
- Extend `<StatusPanel />` to accept a `noiseConfig` prop and display:
  - “Volume threshold: X”
  - “Confidence threshold: Y”

**Acceptance Criteria**
- A test renders `<StatusPanel />` with specific thresholds and asserts those numeric values appear in the text.

---

## Phase 5 – Audio Input Abstraction

### 5.1 Define `AudioInputSource` interface
**Task**
- Create:
  ```ts
  interface AudioInputSource {
    start(): Promise<void>;
    stop(): void;
    onFrame(callback: (samples: Float32Array, sampleRate: number) => void): void;
  }
  ```

**Acceptance Criteria**
- A unit test defines a mock class implementing `AudioInputSource` and asserts:
  - It can be instantiated and the methods can be called without throwing.

---

### 5.2 Implement `MockAudioInputSource`
**Task**
- Implement a mock source that:
  - Stores the frame callback.
  - On `start()`, begins calling it with generated sine-wave samples at a fixed frequency.
  - On `stop()`, stops calling the callback.

**Acceptance Criteria**
- A unit test:
  - Registers a callback that pushes received samples into an array.
  - Calls `start()` and waits for at least one callback.
  - Calls `stop()` and verifies that no further frames are added after stop is invoked.

---

### 5.3 `useAudioInput` hook
**Task**
- Implement a hook:
  ```ts
  function useAudioInput(source: AudioInputSource) {
    // returns { isRunning, start, stop }
  }
  ```
- Manages the internal `isRunning` state.

**Acceptance Criteria**
- A hook test using `renderHook` and `MockAudioInputSource`:
  - Initial `isRunning === false`.
  - After calling `start`, `isRunning === true`.
  - After calling `stop`, `isRunning === false`.

---

## Phase 6 – Pitch Detection Core (Pure Logic)

### 6.1 `detectPitch` utility
**Task**
- Implement:
  ```ts
  function detectPitch(samples: Float32Array, sampleRate: number): number | null;
  ```
- Use a basic pitch-detection algorithm (e.g. autocorrelation or similar), but keep it pure and independent of React.

**Acceptance Criteria**
- Unit tests generate synthetic data:
  - For a sine wave at 440 Hz (`A4`), `detectPitch` returns a value within ±2 Hz.
  - For silence (all zeros), returns `null`.
  - For random noise, returns either `null` or a value marked as unreliable in later steps (defined behavior must be asserted in tests).

---

### 6.2 `createTuningReading` function
**Task**
- Implement:
  ```ts
  function createTuningReading(
    detectedFrequencyHz: number | null,
    targetFrequencyHz: number,
    noiseConfig: NoiseHandlingConfig,
    confidence: number,
    volume: number,
  ): TuningReading;
  ```
- Behavior:
  - If `detectedFrequencyHz` is null → status `'awaiting'`.
  - Compute cents offset when frequency is present.
  - If `volume < minVolumeThreshold` → status `'awaiting'` or `'noisy'` (define clearly).
  - If `confidence < minConfidenceThreshold` → status `'noisy'`.
  - Otherwise, use cents offset to choose `'in_tune'` / `'sharp'` / `'flat'`.

**Acceptance Criteria**
- Unit tests:
  - Frequency equal to target, high volume/confidence → `status = 'in_tune'` and `centsOff` near 0.
  - Slightly above target (e.g. +15 cents) → `status = 'sharp'` and `centsOff` > 0.
  - Slightly below target (e.g. -15 cents) → `status = 'flat'` and `centsOff` < 0.
  - `detectedFrequencyHz = null` → `status = 'awaiting'` regardless of volume/confidence.
  - `volume < minVolumeThreshold` → status behaves as defined (“awaiting” or “noisy”) and the test asserts that.
  - `confidence < minConfidenceThreshold`, even with correct frequency → `status = 'noisy'`.

---

### 6.3 Frequency → closest timple string helper
**Task**
- Implement a helper:
  ```ts
  function closestTimpleString(frequencyHz: number, tuning: TimpleString[]): TimpleString;
  ```

**Acceptance Criteria**
- Unit tests:
  - For frequencies near each of the 5 target frequencies, the helper returns the expected string.
  - The function always returns one of the 5 tuning entries.

---

## Phase 7 – Audio + Detection → UI Integration

### 7.1 Mic permission hook
**Task**
- Implement:
  ```ts
  type MicPermissionState = 'unknown' | 'granted' | 'denied';

  function useMicPermission() {
    // returns { state, requestPermission }
  }
  ```
- For now, use a stub or mock-friendly implementation; later can wrap `getUserMedia`.

**Acceptance Criteria**
- Hook tests:
  - Initially, `state === 'unknown'`.
  - After simulating a successful permission request, `state === 'granted'`.
  - After simulating a denied permission, `state === 'denied'`.

---

### 7.2 Integrate mic status into StatusPanel
**Task**
- Pass the `MicPermissionState` from `useMicPermission` down to `<StatusPanel />`.

**Acceptance Criteria**
- A test mocks `useMicPermission` for `<App />` and asserts:
  - When state is `'unknown'`, StatusPanel shows “Mic: Not requested”.
  - When `'granted'`, shows “Mic: Granted”.
  - When `'denied'`, shows “Mic: Denied”.

---

### 7.3 Start/stop tuning controls in Tuning Panel
**Task**
- Add a button to `<TuningPanel />`:
  - Label: “Start tuning” when not running.
  - Label: “Stop tuning” when running.
  - Disabled if mic permission is `'denied'`.
  - Calls `start` / `stop` functions from `useAudioInput`.

**Acceptance Criteria**
- A test renders the container component that wires `<TuningPanel />` with `useAudioInput` using mocks:
  - Initially, button text is “Start tuning”.
  - Clicking it calls mock `start` and then shows “Stop tuning”.
  - In a mocked `'denied'` mic state, the button is disabled (`toBeDisabled()`).

---

### 7.4 Connect audio frames → pitch detection → TuningReading
**Task**
- In a container (or hook) used by `<App />`:
  - Use `useAudioInput` with either real or `MockAudioInputSource`.
  - For each audio frame, call `detectPitch` to get frequency.
  - Calculate volume and approximate confidence.
  - Create a `TuningReading` via `createTuningReading`.
  - Store reading in state and pass it to `<TuningPanel />`.

**Acceptance Criteria**
- An integration-style test using `MockAudioInputSource` and a mocked `detectPitch` returning a fixed frequency equal to the target:
  - After `start` is invoked, eventually `<TuningPanel />` renders a non-placeholder current frequency value.
  - Status text becomes “In tune” (or equivalent) for that string.

---

## Phase 8 – Per-string Tuning Workflow

### 8.1 “Tune all strings” checklist
**Task**
- Add a lightweight per-string status model:
  ```ts
  type StringTunedState = 'untuned' | 'tuned';
  ```
- Track when a string has been tuned (e.g. status `'in_tune'` for that string at least once).
- Display a small checklist (could be under the Tuning Panel or integrated into String Selection rows) marking tuned strings with a check icon.

**Acceptance Criteria**
- A test simulates reading updates:
  - For string 1, when reading status becomes `'in_tune'`, its corresponding checklist entry is marked “tuned” (e.g. `data-tuned="true"`).
  - Strings with no `'in_tune'` readings remain `data-tuned="false"`.

---

### 8.2 Auto-advance to next string
**Task**
- Add a toggle (e.g. a switch) in Tuning Panel: “Auto-advance to next string when tuned”.
- When enabled and the current string becomes `'in_tune'`, automatically select the next string in the vertical list.

**Acceptance Criteria**
- A test:
  - Turns the auto-advance toggle ON.
  - Simulates a `TuningReading` for current string with `status = 'in_tune'`.
  - Asserts that `selectedString` changes to the next string in the tuning array.

---

## Phase 9 – PWA Support

### 9.1 Web App Manifest
**Task**
- Add `manifest.json` with basic fields:
  - `name`, `short_name`, `start_url`, `display: 'standalone'`, icons.
- Link it from `index.html`.

**Acceptance Criteria**
- A Node-level test or config test reads `manifest.json` and asserts:
  - `name` and `short_name` are non-empty strings.
  - `display` equals `'standalone'`.
  - `start_url` is defined.

---

### 9.2 Service Worker via Vite PWA plugin
**Task**
- Add `vite-plugin-pwa` (or similar) to `vite.config.ts`.
- Configure it to cache main assets and manifest.

**Acceptance Criteria**
- A test imports `vite.config.ts` and asserts that the PWA plugin is present in the `plugins` array.
- Optionally, a CI/build test can run `vite build` and verify that a service worker file exists in the build output directory.

---

### 9.3 Offline-friendly UI messaging
**Task**
- Add an online/offline indicator (e.g. in Status Panel) based on `navigator.onLine`.
- Message: “Basic tuning works offline once loaded.” when offline.

**Acceptance Criteria**
- A test mocks `navigator.onLine = false` and asserts that the offline message is present.
- With `navigator.onLine = true`, the offline message is absent or replaced by an “Online” indicator.

---

## Phase 10 – Noise-handling Extension Hooks

### 10.1 Compute volume and confidence in detection pipeline
**Task**
- Add helper functions to compute:
  - `volume` (RMS or similar) from samples.
  - A heuristic `confidence` metric based on the pitch detection result.

**Acceptance Criteria**
- Unit tests:
  - For a clean, loud sine wave, `volume` > `minVolumeThreshold` and `confidence` > `minConfidenceThreshold`.
  - For random noise at similar amplitude, `confidence` is below `minConfidenceThreshold` (or as defined).

---

### 10.2 Apply noise thresholds in `createTuningReading`
**Task**
- Update logic in `createTuningReading` to enforce noise thresholds from `NoiseHandlingConfig`:
  - If `volume < minVolumeThreshold` → `status` becomes `'awaiting'` or `'noisy'` (defined behavioral rule).
  - If `confidence < minConfidenceThreshold` → `status = 'noisy'`.

**Acceptance Criteria**
- Unit tests cover combinations:
  - Low volume, high confidence → status matches the defined low-volume behavior.
  - High volume, low confidence → `status = 'noisy'`.
  - High volume and confidence, with frequency on target → `status = 'in_tune'`.

---

### 10.3 Show noise-related feedback in StatusPanel
**Task**
- Extend `<StatusPanel />` to accept the latest `TuningReading` (or derived noise info) and display:
  - “Signal too weak” when volume below threshold.
  - “Noisy environment” when confidence below threshold.
  - “Good signal” when both above thresholds.

**Acceptance Criteria**
- Tests pass different mocked readings into `<StatusPanel />` and assert:
  - Low volume → text “Signal too weak”.
  - Low confidence → text “Noisy environment”.
  - Good volume & confidence → text “Good signal”.

---

### 10.4 Optional UI for adjusting noise config
**Task**
- Add sliders or number inputs (e.g. in StatusPanel or a settings sub-section) for:
  - `minVolumeThreshold`
  - `minConfidenceThreshold`
- Update `noiseConfig` state when controls change.

**Acceptance Criteria**
- A test:
  - Renders the noise config controls.
  - Uses Testing Library to change the inputs.
  - Asserts that the displayed threshold values (or internal state exposed for test) are updated to the new numbers.

---

## Phase 11 – Multilingual Support (i18n)

### 11.1 Integrate i18n library
**Task**
- Install a free i18n library (e.g. `react-i18next`).
- Create translation files:
  - `/locales/en/translation.json`
  - `/locales/es/translation.json`
- Wrap the app in the i18n provider so components can use translation keys instead of hard-coded strings.

**Acceptance Criteria**
- A test renders `<App />` with i18n initialized to English and asserts:
  - English texts (e.g. "Timple Tuner", "Tune all 5 strings of your timple") appear from the translation files.

---

### 11.2 Language toggle in Header (EN/ES)
**Task**
- Add a small language toggle in the header (e.g. two buttons “EN” / “ES” or a select).
- When toggled, the app’s current language changes and all visible texts respond.

**Acceptance Criteria**
- A test renders `<App />`, finds the EN/ES toggle, and:
  - Initially asserts English text is present.
  - Clicks the ES toggle.
  - Asserts that key texts change to Spanish equivalents (e.g. title, subtitle, button labels).

---

## Phase 12 – Banner Ad Area

### 12.1 Banner Ad layout and behavior
**Task**
- Implement a `BannerAd` component rendered in the **Banner Ad Area** section (fourth row in the single-column layout):
  - Use Mantine `Paper` or `Card` to make a clearly tappable region.
  - Ensure it spans full width on mobile and is visually distinct from tuning controls.
  - Accept `onAdTap` callback and call it when the banner is clicked/tapped.
  - Content can be placeholder (e.g. “Ad Banner”) for now.

**Acceptance Criteria**
- A test renders `<App />` or `<BannerAd />` and asserts:
  - A node with data-testid (e.g. `banner-ad`) exists in the DOM and is part of the main flow between String Selection and Status Panel.
  - Clicking the banner triggers a mock `onAdTap` function exactly once per click.

---

This is the complete, detailed, and testable plan aligned with:
- Single-column, mobile-first PWA UI.
- Full acceptance criteria for each task.
- Support for 5 timple strings, i18n (EN/ES), noise-handling extension points, and a tappable banner ad area.

