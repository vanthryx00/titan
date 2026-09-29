// Web Audio API sound generator for Shane's Tattoo Shop

let audioCtx = null;
let machineOscillator = null;
let machineGain = null;
let isMachineRunning = false;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playClickSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.04);
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // Ignore audio errors on unsupported browsers
  }
};

export const playSuccessChime = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.35);
    });
  } catch {
    // Ignore audio errors
  }
};

export const toggleTattooMachineSound = (forceState) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    if (forceState === false || isMachineRunning) {
      if (machineOscillator) {
        try {
          machineGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
          setTimeout(() => {
            if (machineOscillator) {
              machineOscillator.stop();
              machineOscillator.disconnect();
              machineOscillator = null;
            }
          }, 100);
        } catch {
          // ignore
        }
      }
      isMachineRunning = false;
      return false;
    } else {
      // Create rotary tattoo machine buzz
      machineOscillator = ctx.createOscillator();
      machineGain = ctx.createGain();
      
      machineOscillator.type = 'sawtooth';
      machineOscillator.frequency.setValueAtTime(115, ctx.currentTime); // 115 Hz tattoo machine frequency
      
      // Add subtle pitch vibration
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(14, ctx.currentTime);
      lfoGain.gain.setValueAtTime(12, ctx.currentTime);
      lfo.connect(machineOscillator.frequency);
      lfo.start();

      machineGain.gain.setValueAtTime(0.01, ctx.currentTime);
      machineGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.1);
      
      machineOscillator.connect(machineGain);
      machineGain.connect(ctx.destination);
      
      machineOscillator.start();
      isMachineRunning = true;
      return true;
    }
  } catch {
    return false;
  }
};

export const isMachineActive = () => isMachineRunning;
