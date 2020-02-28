import React, { useState, useEffect } from 'react';
import {Tonal, Range, Interval, Note as asNote} from '@tonaljs/modules';
import styled from 'styled-components';

import { NoteInput } from './interfaces';
import { formatEnharmonicNote, generateNoteInput } from '../../util/helpers';

const FRET_VB_WIDTH = 400;
const FRET_VB_HEIGHT = 1000;
const MIN_STRING_WIDTH = 8;
const MAX_STRING_WIDTH = 20;
const NUM_OF_STRINGS = 6;
const FRETBOARD_TOP_VB_WIDTH = 20;
const FRETBOARD_VB_PADDING = 80;

interface NoteLabelProps {
  tuning: string[];
  numOfFrets: number;
  showOnHover: boolean;
  showLabelText: boolean;
  notesToShow: NoteInput[];
  handleNoteClick(note: NoteInput): void;
}

const StyledLabelGroup = styled.g<{ showOnHover: boolean; show: boolean }>`
  cursor: pointer;
  opacity: ${props => (props.showOnHover && !props.show ? 0 : 1)};
  transition: opacity 250ms linear;

  &:hover {
    opacity: 1;
  }
`;

function createTonalNotesMap(tuning: string[], numOfFrets: number) {
  return tuning
    .map((stringNote, tuningIdx) => {
      const interval: string = Interval.fromSemitones(numOfFrets);
      const lastNoteOnString: string = asNote.transposeBy(interval)(stringNote);
      return Range.chromatic([stringNote, lastNoteOnString], { sharps: true }).map(Tonal.note);
    })
    .reverse();
}

const NoteLabel: React.FC<NoteLabelProps> = ({
  tuning,
  numOfFrets,
  showOnHover,
  showLabelText,
  notesToShow,
  handleNoteClick,
}: NoteLabelProps) => {
  const [noteLabelMap, setNoteLabelMap] = useState(createTonalNotesMap(tuning, numOfFrets));

  useEffect(() => {
    setNoteLabelMap(createTonalNotesMap(tuning, numOfFrets));
  }, [tuning, numOfFrets]);

  const notesToShowMap: { [key: string]: string | undefined } = {};
  notesToShow.forEach(cur => {
    const octave = cur.octave !== undefined ? cur.octave : '';
    notesToShowMap[`${cur.name}${octave}-${cur.stringNum}`] = cur.status;
  }, {});

  return (
    <svg>
      {noteLabelMap.map((strNotes, strNotesIdx) => {
        const strNum = strNotesIdx + 1; // strings are 1-indexed
        const labelVBPositionCy: number = strNotesIdx * (FRET_VB_HEIGHT / (NUM_OF_STRINGS - 1));
        return strNotes.map((note, fretNum) => {
          const labelVBPositionCx: number =
            fretNum === 0 ? FRETBOARD_TOP_VB_WIDTH / 2 : (fretNum - 1 / 2) * FRET_VB_WIDTH + 20;
          const noteDisplay = formatEnharmonicNote(note);

          const notesToShowKey = `${noteDisplay}${note.oct}-${strNum}`;
          const labelColor =
            notesToShowMap[notesToShowKey] === 'correct'
              ? 'green'
              : notesToShowMap[notesToShowKey] === 'error'
              ? 'red'
              : 'black';

          const handleNoteClickWrapper = () => {
            handleNoteClick(generateNoteInput(note, strNum));
          };

          return (
            <StyledLabelGroup
              showOnHover={showOnHover}
              show={notesToShowMap.hasOwnProperty(notesToShowKey)}
              onClick={handleNoteClickWrapper}
              key={fretNum}
            >
              <circle
                cx={FRETBOARD_VB_PADDING + labelVBPositionCx}
                cy={FRETBOARD_VB_PADDING + labelVBPositionCy}
                r={FRETBOARD_VB_PADDING}
                fill={'white'}
                stroke={labelColor}
                key={`${strNum}-${fretNum}`}
              />
              {!showLabelText && !notesToShowMap.hasOwnProperty(notesToShowKey) ? null : (
                <text
                  x={FRETBOARD_VB_PADDING + labelVBPositionCx}
                  y={FRETBOARD_VB_PADDING + labelVBPositionCy}
                  textAnchor={'middle'}
                  stroke={labelColor}
                  alignmentBaseline={'central'}
                  fontSize={FRETBOARD_VB_PADDING * (3 / 4)}
                >
                  {noteDisplay}
                </text>
              )}
            </StyledLabelGroup>
          );
        });
      })}
    </svg>
  );
};

export default NoteLabel;
