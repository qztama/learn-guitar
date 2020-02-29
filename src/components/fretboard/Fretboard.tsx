import React from 'react';
import NoteLabel from './NoteLabel';

import { NoteInput } from './interfaces';
import {
  FRET_VB_WIDTH,
  FRET_VB_HEIGHT,
  MIN_STRING_WIDTH,
  MAX_STRING_WIDTH,
  NUM_OF_STRINGS,
  FRETBOARD_TOP_VB_WIDTH,
  FRETBOARD_VB_PADDING,
} from './constants';

interface FretProps {
  fretNum: number;
  xOffset: number;
}

interface TuningLabelProps {
  tuning: string[];
}

interface FretboardProps {
  tuning: string[];
  numOfFrets: number;
  showLabelText: boolean;
  notesToShow: NoteInput[];
  handleNoteClick(note: NoteInput): void;
}

const Fret: React.FC<FretProps> = ({ fretNum, xOffset }: FretProps) => {
  let fretMarker = null;
  let fretLabel = null;

  if ([3, 5, 7, 9].includes(fretNum % 12)) {
    fretMarker = <circle cx={FRET_VB_WIDTH / 2} cy={FRET_VB_HEIGHT / 2} r={50} />;
  } else if (fretNum % 12 === 0) {
    fretMarker = (
      <g>
        <circle cx={FRET_VB_WIDTH / 2} cy={(3 / 10) * FRET_VB_HEIGHT} r={50} />
        <circle cx={FRET_VB_WIDTH / 2} cy={(7 / 10) * FRET_VB_HEIGHT} r={50} />
      </g>
    );
  }

  if ([0, 3, 5, 7, 9].includes(fretNum % 12)) {
    fretLabel = (
      <text
        x={FRET_VB_WIDTH / 2}
        y={FRET_VB_HEIGHT + FRETBOARD_VB_PADDING}
        textAnchor={'middle'}
        alignmentBaseline={'central'}
        fontSize={FRETBOARD_VB_PADDING}
      >
        {`fret ${fretNum}`}
      </text>
    );
  }

  return (
    <svg id={`fret-${fretNum}`} x={xOffset} stroke={'black'}>
      <rect width={FRET_VB_WIDTH} height={FRET_VB_HEIGHT} fill={'white'} strokeWidth={1} stroke={'black'} />
      <rect x={FRET_VB_WIDTH} width={10} height={FRET_VB_HEIGHT} />
      {fretMarker}
      {fretLabel}
    </svg>
  );
};

const TuningLabel: React.FC<TuningLabelProps> = ({ tuning }: TuningLabelProps) => {
  const reversedTuning = tuning.slice().reverse();
  const labels = reversedTuning.map((note, tuningIdx) => {
    const labelVBPositionY = FRETBOARD_VB_PADDING + tuningIdx * (FRET_VB_HEIGHT / (NUM_OF_STRINGS - 1));
    return (
      <text key={note} x={0} y={labelVBPositionY} alignmentBaseline={'central'} fontSize={FRETBOARD_VB_PADDING}>
        {note}
      </text>
    );
  });

  return <svg>{labels}</svg>;
};

const Fretboard: React.FC<FretboardProps> = ({
  tuning,
  numOfFrets,
  showLabelText,
  notesToShow,
  handleNoteClick,
}: FretboardProps) => {
  const fretboardVBWidth: number = numOfFrets * FRET_VB_WIDTH + FRETBOARD_TOP_VB_WIDTH;
  const frets = [];

  for (let i = 0; i < numOfFrets; i += 1) {
    frets.push(<Fret key={`fret-${i + 1}`} fretNum={i + 1} xOffset={FRETBOARD_TOP_VB_WIDTH + FRET_VB_WIDTH * i} />);
  }

  const strings = [];
  for (let i = 0; i < NUM_OF_STRINGS; i += 1) {
    const curStringWidth = MIN_STRING_WIDTH + (i * (MAX_STRING_WIDTH - MIN_STRING_WIDTH)) / NUM_OF_STRINGS;
    strings.push(
      <svg key={`string-${i + 1}`} y={((FRET_VB_HEIGHT - 1 * MAX_STRING_WIDTH) / (NUM_OF_STRINGS - 1)) * i}>
        <rect height={curStringWidth} width={fretboardVBWidth} fill={'white'} stroke={'black'} strokeWidth={2} />
      </svg>,
    );
  }

  return (
    <svg
      xmlns={'http://www.w3.org/2000/svg'}
      width={80 * numOfFrets}
      viewBox={`0 0 ${fretboardVBWidth + 3 * FRETBOARD_VB_PADDING + 1} ${1000 + 3 * FRETBOARD_VB_PADDING + 1}`}
    >
      <TuningLabel tuning={tuning} />
      <svg x={2 * FRETBOARD_VB_PADDING} y={FRETBOARD_VB_PADDING}>
        <rect id={'fretboard-top'} width={FRETBOARD_TOP_VB_WIDTH} height={FRET_VB_HEIGHT} fill={'black'} />
        {frets}
        {strings}
      </svg>
      <svg x={FRETBOARD_VB_PADDING}>
        <NoteLabel
          tuning={tuning}
          numOfFrets={numOfFrets}
          showOnHover={true}
          showLabelText={showLabelText}
          notesToShow={notesToShow}
          handleNoteClick={handleNoteClick}
        />
      </svg>
    </svg>
  );
};

export default Fretboard;
