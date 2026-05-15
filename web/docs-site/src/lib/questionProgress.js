import { useEffect, useMemo, useState } from "react";
import { progressSteps, questionBank } from "../data/catalog.js";

export const QUESTION_PROGRESS_STORAGE_KEY = "mianshiti-question-progress";
export const DEFAULT_PROGRESS = progressSteps[0];

export function emptyProgressMap() {
  return {};
}

export function getQuestionState(progressMap, id) {
  return progressMap[id] ?? { favorite: false, progress: DEFAULT_PROGRESS };
}

export function readProgressMap() {
  if (typeof window === "undefined") {
    return emptyProgressMap();
  }

  try {
    const raw = window.localStorage.getItem(QUESTION_PROGRESS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : emptyProgressMap();
  } catch {
    return emptyProgressMap();
  }
}

export function useQuestionProgress() {
  const [progressMap, setProgressMap] = useState(emptyProgressMap);

  useEffect(() => {
    setProgressMap(readProgressMap());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(QUESTION_PROGRESS_STORAGE_KEY, JSON.stringify(progressMap));
  }, [progressMap]);

  const progressSummary = useMemo(() => {
    return questionBank.reduce(
      (accumulator, item) => {
        const state = getQuestionState(progressMap, item.id);
        accumulator.total += 1;
        if (state.favorite) accumulator.favorites += 1;
        if (state.progress === "已练") accumulator.done += 1;
        if (state.progress === "需复习") accumulator.review += 1;
        if (state.progress === "已看") accumulator.viewed += 1;
        return accumulator;
      },
      { total: 0, favorites: 0, done: 0, review: 0, viewed: 0 }
    );
  }, [progressMap]);

  function updateQuestionState(id, patch) {
    setProgressMap((current) => {
      const previous = getQuestionState(current, id);
      return {
        ...current,
        [id]: {
          ...previous,
          ...patch,
        },
      };
    });
  }

  return {
    progressMap,
    progressSummary,
    getState: (id) => getQuestionState(progressMap, id),
    updateQuestionState,
  };
}

