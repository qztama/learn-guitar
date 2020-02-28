import {NoNote, Note} from "@tonaljs/modules/dist/tonal";
import {Note as asNote} from "@tonaljs/modules";
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

export { formatEnharmonicNote, generateNoteInput, convertToHHMMSS };
