import React from 'react';
import { Fretboard } from './Fretboard';

const STANDARD_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

export default {
  title: 'Fretboard',
  component: Fretboard,
};

export const Default = () => (
  <Fretboard handleNoteClick={note => console.log(note)} tuning={STANDARD_TUNING} numOfFrets={12} />
);
