import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import seedrandom from 'seedrandom';
import { Tonal, Range, Interval } from '@tonaljs/modules';
import { NoteInput } from '../components/fretboard/interfaces';

import Fretboard from '../components/fretboard/Fretboard';
import useTimer from '../hooks/useTimer';

import { formatEnharmonicNote, generateNoteInput, convertToHHMMSS } from '../util/helpers';

const STANDARD_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
const NUM_OF_FRETS = 19;

function pickNoteForToday(): string {
  const exampleTest: { [key: string]: number } = {
    A: 3,
    'A#/Bb': 2,
    B: 4,
    C: 2,
    'C#/Db': 1,
    D: 4,
    'D#/Eb': 3,
    E: 2,
    F: 2,
    'F#/Gb': 5,
    G: 3,
    'G#/Ab': 2,
  };

  const maxOccurrence = Object.values(exampleTest).reduce((acc, cur) => (cur > acc ? cur : acc), 1);
  const inverseOccurrenceMap = Object.entries(exampleTest).reduce((acc: { [key: string]: number }, [key, val]) => {
    acc[key] = maxOccurrence - val;
    return acc;
  }, {});

  const curDate = new Date();
  const rngVal = seedrandom(curDate.toLocaleDateString()).quick();

  const allNotes = Range.chromatic(['C3', 'B3'], { sharps: true }).map(noteWithOctave => {
    return formatEnharmonicNote(Tonal.note(noteWithOctave));
  });

  // add 1 in case the object contains all zeroes
  const totalExercisesCompleted: number = Object.values(inverseOccurrenceMap).reduce((acc, curVal) => acc + curVal, 0);
  let i = 0;
  let acc = 0;

  while (acc + inverseOccurrenceMap[allNotes[i]] / totalExercisesCompleted < rngVal) {
    acc += inverseOccurrenceMap[allNotes[i]] / totalExercisesCompleted;
    i += 1;
  }

  return allNotes[i];
}

function generateExercise(note: string, tuning: string[], numOfFrets: number) {
  const exercise: NoteInput[] = [];
  const parsedNote = note.split('/').length === 2 ? note.split('/')[0] : note;

  tuning.forEach((tuningNote, tuningIdx) => {
    const stringNum = 6 - tuningIdx;
    let semitonesFromNote = Tonal.interval(Tonal.distance(tuningNote, parsedNote)).semitones;

    while (semitonesFromNote !== undefined && semitonesFromNote <= numOfFrets) {
      const nextNote = Tonal.note(Tonal.transpose(tuningNote, Interval.fromSemitones(semitonesFromNote)));
      exercise.push(generateNoteInput(nextNote, stringNum));
      semitonesFromNote += 12; // get next octave for the note
    }
  });

  return exercise.concat(exercise.slice(1, exercise.length - 1).reverse());
}

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
`;
const PageTitle = styled.h1``;

const ExerciseRow = styled.div<{ centered?: boolean }>`
  width: 100%;
  display: flex;
  justify-content: ${props => (props.centered ? 'center' : 'space-between')};
  text-align: left;
  padding: 16px 0;
`;

const ExerciseInfoEntryTitle = styled.h3`
  margin: 0 0 8px 0;
`;

const ExerciseInfoEntry: React.FC<{ title: string; content: string | number }> = ({
  title,
  content,
}: {
  title: string;
  content: string | number;
}) => {
  return (
    <div>
      <ExerciseInfoEntryTitle>{title}</ExerciseInfoEntryTitle>
      <div>{content}</div>
    </div>
  );
};

const ExerciseButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 24px;
  outline: none;
  width: fit-content;
  cursor: pointer;
`;

const OneNoteADay: React.FC<{}> = () => {
  const [noteForToday, setNoteForToday] = useState<string>('C');
  const [exercise, setExercise] = useState<NoteInput[]>([]);
  useEffect(() => {
    const noteForToday = pickNoteForToday();
    setNoteForToday(noteForToday);
    setExercise(generateExercise(noteForToday, STANDARD_TUNING, NUM_OF_FRETS));
  }, []);

  const [exerciseMode, setExerciseMode] = useState<boolean>(false);
  const [exerciseIdx, setExerciseIdx] = useState<number>(0);

  const { seconds, pause, resume, restart } = useTimer(600);

  const [notesToShow, setNotesToShow] = useState<NoteInput[]>([]);

  // analytics
  const [roundsCompleted, setRoundsCompleted] = useState<number>(-1);
  useEffect(() => {
    if (exerciseIdx === 0) {
      setRoundsCompleted(val => val + 1);
    }
  }, [exerciseIdx]);

  const [avgResponseTimeObj, setAvgResponseTimeObj] = useState<{
    runningAvg: number;
    totalAnswers: number;
    prevTime: null | number;
    bufferedTime: number;
  }>({
    runningAvg: 0,
    totalAnswers: 0,
    prevTime: null,
    bufferedTime: 0,
  });
  useEffect(() => {
    const newAvgResponseTimeObj = Object.assign({}, avgResponseTimeObj);

    if (exerciseMode) {
      // toggled start or input a note
      if (avgResponseTimeObj.prevTime === null) {
        // toggled start
        newAvgResponseTimeObj.prevTime = Date.now() - avgResponseTimeObj.bufferedTime;
        newAvgResponseTimeObj.bufferedTime = 0;
      } else {
        const { runningAvg, totalAnswers, prevTime } = avgResponseTimeObj;
        // input a note; calculate new running avg and set state for next calculation
        newAvgResponseTimeObj.runningAvg = (runningAvg * totalAnswers + Date.now() - prevTime) / (totalAnswers + 1);
        newAvgResponseTimeObj.totalAnswers = totalAnswers + 1;
        newAvgResponseTimeObj.prevTime = Date.now();
        newAvgResponseTimeObj.bufferedTime = 0;
      }
    } else {
      // initial call or paused
      if (avgResponseTimeObj.prevTime) {
        // paused since prev time will be set if paused
        newAvgResponseTimeObj.bufferedTime = Date.now() - avgResponseTimeObj.prevTime!;
        newAvgResponseTimeObj.prevTime = null;
      }
    }

    setAvgResponseTimeObj(newAvgResponseTimeObj);
  }, [exerciseIdx, exerciseMode]);

  const [errors, setErrors] = useState<number>(0);
  useEffect(() => {
    if (notesToShow.length > 1) {
      setErrors(numOfErrors => numOfErrors + 1);
    }
  }, [notesToShow]);

  function handleNoteInput(noteInput: NoteInput) {
    if (exerciseMode) {
      const curExerciseNoteInput = exercise[exerciseIdx];
      const gradedNoteInput = generateNoteInput(
        Tonal.note(noteInput.baseName),
        noteInput.stringNum,
        curExerciseNoteInput,
      );
      const notesToShow = [gradedNoteInput];

      if (gradedNoteInput.status === 'error') {
        notesToShow.push(curExerciseNoteInput);
      }

      setNotesToShow(notesToShow);
      setExerciseIdx(idx => (idx + 1) % exercise.length);
    }
  }

  function handleExerciseToggle() {
    if (exerciseMode) {
      // toggling to exerciseMode off
      pause();
    } else {
      // toggling to exerciseMode on
      resume();
    }

    setExerciseMode(em => !em);
  }

  return (
    <PageContainer>
      <PageTitle>Fretboard Memorization</PageTitle>
      <ExerciseRow>
        <ExerciseInfoEntry
          title="Instructions"
          content={`Identify all the ${noteForToday}'s, starting with the lowest string. Find all instances
            of the note on each string before moving up to the next string higher up. After finishing with the highest
            string, continue to identify notes but in the reverse order.`}
        />
      </ExerciseRow>
      <ExerciseRow>
        <ExerciseInfoEntry title="Note For Today" content={noteForToday} />
        <ExerciseInfoEntry title="Timer" content={convertToHHMMSS(seconds)} />
        <ExerciseInfoEntry title="Rounds" content={roundsCompleted} />
        <ExerciseInfoEntry
          title="Avg Response Time"
          content={avgResponseTimeObj.runningAvg ? `${Math.ceil(avgResponseTimeObj.runningAvg)}ms` : 'N/A'}
        />
        <ExerciseInfoEntry title="Errors" content={errors} />
      </ExerciseRow>
      <ExerciseRow centered>
        <Fretboard
          tuning={STANDARD_TUNING}
          numOfFrets={NUM_OF_FRETS}
          showLabelText={!exerciseMode}
          notesToShow={notesToShow}
          handleNoteClick={handleNoteInput}
        />
      </ExerciseRow>
      <ExerciseRow centered={true}>
        <ExerciseButton onClick={handleExerciseToggle}>{exerciseMode ? 'Pause' : 'Start'}</ExerciseButton>
      </ExerciseRow>
    </PageContainer>
  );
};

export default OneNoteADay;
