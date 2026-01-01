import { Howl } from 'howler';

function tone(frequency: number, duration = 0.08) {
  const sampleRate = 44100;
  const length = sampleRate * duration;
  const data = new Int16Array(length);
  for (let i = 0; i < length; i++) {
    const v = Math.sin((2 * Math.PI * frequency * i) / sampleRate);
    data[i] = v * 32767 * Math.exp(-i / length);
  }
  const buffer = new Uint8Array(44 + data.length * 2);
  const view = new DataView(buffer.buffer);
  const writeString = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + data.length * 2, true);
  writeString(8, 'WAVEfmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, data.length * 2, true);
  data.forEach((sample, idx) => view.setInt16(44 + idx * 2, sample, true));
  const bytes = Array.from(buffer).map((b) => String.fromCharCode(b)).join('');
  return `data:audio/wav;base64,${btoa(bytes)}`;
}

export const sounds = {
  paper: new Howl({ src: [tone(240)] }),
  clip: new Howl({ src: [tone(120)] }),
  stamp: new Howl({ src: [tone(80)] }),
  lamp: new Howl({ src: [tone(60, 0.3)], loop: true, volume: 0.2 }),
  warning: new Howl({ src: [tone(30, 0.4)], volume: 0.4 })
};
