"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { QuizItem } from "@/content/schema";
import { VALID_ARGUMENT } from "@/content/schema";
import { Card } from "@/components/ui/Card";
import { ShareButton } from "@/components/ui/ShareButton";
import { track } from "@/lib/analytics";
import {
  msUntilNextSet,
  pickDailySet,
  QUESTIONS_PER_DAY,
  quizNumber,
  wibDayIndex,
} from "@/lib/quiz/daily";
import { answersForDay, scoreAnswers, type DailyProgress } from "@/lib/quiz/progress";
import { buildShareText, formatCountdown } from "@/lib/quiz/share";
import { displayedStreak, parseStreak, recordCompletion } from "@/lib/quiz/streak";
import { isAvailable, readJSON, writeJSON } from "@/lib/storage";
import { useHydrated } from "@/lib/useHydrated";

export type OptionLabels = Record<string, { nameId: string; nameEn: string }>;

type DailyQuizProps = {
  pool: QuizItem[];
  labels: OptionLabels;
};

const PROGRESS_KEY = "quiz:progress";
const STREAK_KEY = "quiz:streak";

function optionLabel(option: string, labels: OptionLabels) {
  if (option === VALID_ARGUMENT)
    return { nameId: "Argumen Valid", nameEn: "Tidak ada sesat pikir" };
  return labels[option] ?? { nameId: option, nameEn: "" };
}

/** The daily set depends on the client's clock, so it only renders after hydration. */
export function DailyQuiz({ pool, labels }: DailyQuizProps) {
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <Card accent="gold" className="min-h-72">
        <p className="text-muted">Menyiapkan kuis hari ini…</p>
      </Card>
    );
  }
  const day = wibDayIndex(new Date());
  return <QuizSession key={day} day={day} pool={pool} labels={labels} />;
}

function QuizSession({ day, pool, labels }: DailyQuizProps & { day: number }) {
  const questions = pickDailySet(pool, day);
  const correct = questions.map((q) => q.answer);

  // Lazy initialisers run once on the client: QuizSession only mounts after hydration.
  const [answers, setAnswers] = useState<string[]>(() =>
    answersForDay(readJSON(PROGRESS_KEY, null), day, QUESTIONS_PER_DAY),
  );
  const [streak, setStreak] = useState(() => parseStreak(readJSON(STREAK_KEY, null)));
  const [storageOk] = useState(() => isAvailable());
  // True while showing feedback for the question just answered.
  const [revealed, setRevealed] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const results = scoreAnswers(answers, correct);
  const finished = answers.length === questions.length && !revealed;

  function answer(option: string) {
    const next = [...answers, option];
    setAnswers(next);
    setRevealed(true);
    writeJSON(PROGRESS_KEY, { day, answers: next } satisfies DailyProgress);

    if (next.length === questions.length) {
      const updated = recordCompletion(streak, day);
      setStreak(updated);
      writeJSON(STREAK_KEY, updated);
      track({
        name: "quiz_completed",
        props: {
          score: scoreAnswers(next, correct).filter(Boolean).length,
          streak: updated.current,
        },
      });
    }
  }

  /** Moves on from feedback and brings the next question (or result) into view. */
  function advance() {
    setRevealed(false);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ block: "start" }));
  }

  if (finished) {
    return (
      <div ref={topRef} className="scroll-mt-20">
        <ResultView
          day={day}
          questions={questions}
          answers={answers}
          results={results}
          streak={storageOk ? displayedStreak(streak, day) : null}
          labels={labels}
        />
      </div>
    );
  }

  const index = revealed ? answers.length - 1 : answers.length;
  const question = questions[index];
  const picked = revealed ? answers[index] : null;

  return (
    <div ref={topRef} className="scroll-mt-20">
      <Card accent="gold">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            Kuis #{quizNumber(day)} · Soal {index + 1} dari {questions.length}
          </span>
          {storageOk && displayedStreak(streak, day) > 0 && (
            <span aria-label={`Streak ${displayedStreak(streak, day)} hari`}>
              🔥 {displayedStreak(streak, day)}
            </span>
          )}
        </div>
        <ProgressDots total={questions.length} results={results} current={index} />

        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-gold">
          {question.context}
        </p>
        <blockquote className="mt-3 text-xl font-semibold leading-snug sm:text-2xl">
          &ldquo;{question.statement}&rdquo;
        </blockquote>

        <fieldset className="mt-6" disabled={revealed}>
          <legend className="mb-3 text-sm text-muted">Sesat pikir apa yang dipakai?</legend>
          <ul className="grid gap-2">
            {question.options.map((option) => {
              const label = optionLabel(option, labels);
              const isAnswer = option === question.answer;
              const isPicked = option === picked;
              let state = "border-border hover:bg-surface-strong";
              if (revealed && isAnswer) state = "border-good bg-good/10";
              else if (revealed && isPicked) state = "border-bad bg-bad/10";
              else if (revealed) state = "border-border opacity-60";
              return (
                <li key={option}>
                  <button
                    type="button"
                    onClick={() => answer(option)}
                    className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors disabled:cursor-default ${state}`}
                  >
                    <span>
                      <span className="font-semibold">{label.nameId}</span>
                      {label.nameEn && (
                        <span className="ml-2 text-sm text-muted">{label.nameEn}</span>
                      )}
                    </span>
                    {revealed && isAnswer && (
                      <span className="shrink-0 whitespace-nowrap text-sm text-good">✓ Benar</span>
                    )}
                    {revealed && isPicked && !isAnswer && (
                      <span className="shrink-0 whitespace-nowrap text-sm text-bad">
                        ✗ Pilihanmu
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <div aria-live="polite">
          {revealed && picked !== null && (
            <div className="mt-6 rounded-xl border border-border bg-surface p-4">
              <p
                className={`font-semibold ${picked === question.answer ? "text-good" : "text-bad"}`}
              >
                {picked === question.answer ? "Tepat!" : "Belum tepat."}
              </p>
              <p className="mt-2 text-sm leading-relaxed">{question.explanation}</p>
              {question.answer !== VALID_ARGUMENT && (
                <Link
                  href={`/kamus-sesat-pikir/#${question.answer}`}
                  className="mt-3 inline-block text-sm font-semibold text-gold underline-offset-4 hover:underline"
                >
                  Pelajari {optionLabel(question.answer, labels).nameId} di Kamus →
                </Link>
              )}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={advance}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gold px-5 text-sm font-semibold text-bg hover:bg-gold/85"
                >
                  {answers.length === questions.length ? "Lihat hasil" : "Soal berikutnya"}
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function ProgressDots({
  total,
  results,
  current,
}: {
  total: number;
  results: boolean[];
  current: number;
}) {
  return (
    <ol className="mt-3 flex gap-2" aria-hidden>
      {Array.from({ length: total }, (_, i) => {
        let color = "bg-surface-strong";
        if (i < results.length) color = results[i] ? "bg-good" : "bg-bad";
        else if (i === current) color = "bg-gold";
        return <li key={i} className={`h-1.5 flex-1 rounded-full ${color}`} />;
      })}
    </ol>
  );
}

function ResultView({
  day,
  questions,
  answers,
  results,
  streak,
  labels,
}: {
  day: number;
  questions: QuizItem[];
  answers: string[];
  results: boolean[];
  /** null when storage is unavailable: streaks can't be tracked. */
  streak: number | null;
  labels: OptionLabels;
}) {
  const score = results.filter(Boolean).length;
  const shareText = buildShareText({
    number: quizNumber(day),
    results,
    streak: streak ?? 0,
    url: window.location.href.split("#")[0],
  });

  return (
    <div className="grid gap-4">
      <Card accent="gold" className="text-center">
        <p className="text-xs text-muted">Kuis Sesat Pikir #{quizNumber(day)}</p>
        <p className="num mt-2 text-5xl font-bold" data-testid="quiz-score">
          {score}/{questions.length}
        </p>
        <p className="mt-1 font-semibold">Benar</p>
        <p className="mt-3 text-2xl tracking-widest" aria-hidden>
          {results.map((ok) => (ok ? "🟩" : "🟥")).join("")}
        </p>
        {streak !== null && (
          <p className="mt-3 text-lg font-semibold" data-testid="quiz-streak">
            🔥 {streak} hari berturut-turut
          </p>
        )}
        <div className="mt-6">
          <ShareButton text={shareText} />
        </div>
        <Countdown />
      </Card>

      <Card>
        <h2 className="font-semibold">Pembahasan hari ini</h2>
        <ol className="mt-4 grid gap-4">
          {questions.map((q, i) => (
            <li key={q.id} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
              <p className="text-sm">
                <span className={results[i] ? "text-good" : "text-bad"}>
                  {results[i] ? "✓" : "✗"}
                </span>{" "}
                &ldquo;{q.statement}&rdquo;
              </p>
              <p className="mt-1 text-sm text-muted">
                Jawaban:{" "}
                <span className="font-semibold text-text">
                  {optionLabel(q.answer, labels).nameId}
                </span>
                {!results[i] && <> · Pilihanmu: {optionLabel(answers[i], labels).nameId}</>}
              </p>
            </li>
          ))}
        </ol>
        <Link
          href="/kamus-sesat-pikir/"
          className="mt-6 inline-block text-sm font-semibold text-gold underline-offset-4 hover:underline"
        >
          Buka Kamus Sesat Pikir →
        </Link>
      </Card>
    </div>
  );
}

function Countdown() {
  const [ms, setMs] = useState(() => msUntilNextSet(new Date()));
  useEffect(() => {
    const id = setInterval(() => setMs(msUntilNextSet(new Date())), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <p className="mt-4 text-sm text-muted">
      Kuis berikutnya dalam <span className="num text-text">{formatCountdown(ms)}</span>
    </p>
  );
}
