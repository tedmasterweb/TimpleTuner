# Wire-Up Development Plan

Tasks to complete the Timple Tuner application by connecting all existing components.

---

## 1. Create MicrophoneAudioInputSource

Implement a real microphone audio input source that:
- Uses Web Audio API (AudioContext + MediaStreamSource)
- Implements the `AudioInputSource` interface
- Captures audio frames from the microphone and passes them to the callback

**Acceptance Criteria:**
- Implements `start()`, `stop()`, and `onFrame()` methods
- Uses `navigator.mediaDevices.getUserMedia` for microphone access
- Uses `ScriptProcessorNode` or `AudioWorkletNode` to capture frames

---

## 2. Add noiseConfig state to App

Create state for `NoiseHandlingConfig` in App with:
- Initial values from `defaultNoiseHandlingConfig`
- Handler function to update the config

**Acceptance Criteria:**
- `noiseConfig` state initialized with default values
- `handleNoiseConfigChange` function updates state

---

## 3. Add tunedStrings state to App

Create state to track which strings have been tuned:
- `Record<string, StringTunedState>` initialized with all strings as 'untuned'
- Update to 'tuned' when a string reaches 'in_tune' status

**Acceptance Criteria:**
- State tracks tuned status for all 5 strings
- Automatically marks string as tuned when `reading.status === 'in_tune'`

---

## 4. Add online/offline state to App

Create state to track online status:
- Use `navigator.onLine` for initial value
- Listen to `online`/`offline` window events

**Acceptance Criteria:**
- `isOnline` state reflects actual connectivity
- Updates when connectivity changes

---

## 5. Integrate useTuning hook in App

Connect the tuning pipeline:
- Create/use MicrophoneAudioInputSource instance
- Call `useTuning` with the source and selected string's frequency
- Pass `reading`, `isRunning`, `start`, `stop` to TuningPanel

**Acceptance Criteria:**
- TuningPanel receives live tuning data
- Start/Stop button controls audio capture
- Reading updates in real-time

---

## 6. Integrate useAutoAdvance hook in App

Connect auto-advance functionality:
- Call `useAutoAdvance` with current string and tuning status
- Pass `autoAdvanceEnabled` and `setAutoAdvanceEnabled` to TuningPanel
- Auto-advance to next string when tuned

**Acceptance Criteria:**
- Toggle controls auto-advance behavior
- Automatically selects next string when current is in tune

---

## 7. Wire tunedStrings to StringSelection

Pass `tunedStrings` state to StringSelection component:
- Show checkmarks for tuned strings

**Acceptance Criteria:**
- Tuned strings display checkmark
- Visual feedback persists across string selection

---

## 8. Wire all props to StatusPanel

Pass all status props:
- `noiseConfig` and `onNoiseConfigChange` for adjustable thresholds
- `isOnline` for connectivity status
- `signalQuality` derived from current reading (volume, confidence)

**Acceptance Criteria:**
- Sliders adjust noise thresholds
- Signal quality feedback updates in real-time
- Online/offline status displays correctly

---

## 9. Request mic permission on Start

Integrate mic permission flow:
- Call `requestPermission()` when Start button is clicked (if status is 'unknown')
- Handle denied permission gracefully
- Update `micPermissionDenied` prop on TuningPanel

**Acceptance Criteria:**
- First Start click requests permission
- Denied permission disables Start button
- Granted permission allows tuning to begin

---

## 10. Add integration tests for full flow

Write tests verifying:
- Full tuning flow from start to in_tune detection
- Auto-advance behavior
- Noise config adjustments affect tuning status
- Permission handling

**Acceptance Criteria:**
- Tests use MockAudioInputSource for deterministic behavior
- Cover happy path and edge cases

---

## Summary

| Task | Component/Hook | Description |
|------|---------------|-------------|
| 1 | MicrophoneAudioInputSource | Real microphone input |
| 2 | App state | Noise config management |
| 3 | App state | Tuned strings tracking |
| 4 | App state | Online/offline status |
| 5 | App + useTuning | Main tuning pipeline |
| 6 | App + useAutoAdvance | Auto-advance feature |
| 7 | StringSelection | Tuned checkmarks |
| 8 | StatusPanel | Full status display |
| 9 | App | Permission flow |
| 10 | Tests | Integration coverage |
