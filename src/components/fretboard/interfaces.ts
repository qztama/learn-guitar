export interface NoteInput {
  name: string;
  baseName: string;
  freq: number | null | undefined;
  octave: number | undefined;
  stringNum: number;
  status?: string;
}
