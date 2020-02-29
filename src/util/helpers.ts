import { NoNote, Note } from '@tonaljs/modules/dist/tonal';
import { Note as asNote } from '@tonaljs/modules';
import { NoteInput } from '../components/fretboard/interfaces';

const formatEnharmonicNote = (note: Note | NoNote) => {
  if (note.acc === 'b') {
    return `${asNote.enharmonic(note.pc)}/${note.pc}`;
  }
  if (note.acc === '#') {
    return `${note.pc}/${asNote.enharmonic(note.pc)}`;
  }
  return note.pc;
};

const generateNoteInput = (
  note: Note | NoNote,
  stringNum: number,
  compareNoteInput: NoteInput | null = null,
): NoteInput => {
  const result: NoteInput = {
    name: formatEnharmonicNote(note),
    baseName: note.name,
    freq: note.freq,
    octave: note.oct,
    stringNum: stringNum,
  };

  if (compareNoteInput !== null) {
    result.status =
      result.name === compareNoteInput.name &&
      result.stringNum === compareNoteInput.stringNum &&
      result.octave === compareNoteInput.octave
        ? 'correct'
        : 'error';
  }

  return result;
};

function pad(num: number): string {
  return ('0' + num).slice(-2);
}

const convertToHHMMSS = (secs: number) => {
  const seconds = secs % 60;
  const minutes = Math.floor(secs / 60) % 60;
  const hours = Math.floor(secs / 3600);
  return `${hours > 0 ? (hours >= 100 ? `${hours}:` : `${pad(hours)}:`) : ''}${pad(minutes)}:${pad(seconds)}`;
};

const MIDI_SOUND_SCALE_MAP: { [note: string]: number } = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
};

const getMIDISoundPitchNumber = (note: Note): number => {
  if (!MIDI_SOUND_SCALE_MAP.hasOwnProperty(note.pc)) {
    console.error(`${note.pc} not found in map.`);
    return 36; // return middle C by default
  } else if (note.oct === null || note.oct === undefined) {
    console.error('Octave not found on note.');
    return 36; // return middle C by default
  }
  return 12 * note.oct + MIDI_SOUND_SCALE_MAP[note.pc];
};

export { formatEnharmonicNote, generateNoteInput, convertToHHMMSS, getMIDISoundPitchNumber };
