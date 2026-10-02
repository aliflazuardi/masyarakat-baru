"use client";

import { useRef, useState } from "react";
import type { EndingNode, Scenario } from "@/content/schema";
import { Card } from "@/components/ui/Card";
import { ShareButton } from "@/components/ui/ShareButton";
import { track } from "@/lib/analytics";
import { randomSeed } from "@/lib/random";
import {
  choicesFor,
  choose,
  currentNode,
  initialState,
  replay,
  type RunState,
} from "@/lib/simulator/engine";
import { readJSON, remove, writeJSON } from "@/lib/storage";
import { useHydrated } from "@/lib/useHydrated";
import { MeterBars } from "./MeterBars";

type Saved = { seed: number; choices: number[] };

const storageKey = (slug: string) => `sim:${slug}`;

function loadSaved(scenario: Scenario): RunState | null {
  const saved = readJSON<Saved | null>(storageKey(scenario.slug), null);
  if (!saved || !Number.isInteger(saved.seed) || !Array.isArray(saved.choices)) return null;
  return replay(scenario, saved.seed, saved.choices);
}

export function ScenarioPlayer({ scenario }: { scenario: Scenario }) {
  // The run depends on localStorage and a random seed, so render only on the client.
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <Card accent="pink" className="min-h-72">
        <p className="text-muted">Menyiapkan simulasi…</p>
      </Card>
    );
  }
  return <Player scenario={scenario} />;
}

function Player({ scenario }: { scenario: Scenario }) {
  const [run, setRun] = useState<RunState | null>(() => loadSaved(scenario));
  const topRef = useRef<HTMLDivElement>(null);

  function update(next: RunState | null) {
    setRun(next);
    if (next) {
      writeJSON(storageKey(scenario.slug), {
        seed: next.seed,
        choices: next.path.map((p) => p.choiceIndex),
      } satisfies Saved);
      const node = currentNode(scenario, next);
      if (node.type === "ending" && next.path.length > 0) {
        track({ name: "scenario_completed", props: { slug: scenario.slug, ending: next.node } });
      }
    } else {
      remove(storageKey(scenario.slug));
    }
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ block: "start" }));
  }

  return (
    <div ref={topRef} className="scroll-mt-20">
      {run === null ? (
        <Intro scenario={scenario} onStart={() => update(initialState(scenario, randomSeed()))} />
      ) : currentNode(scenario, run).type === "ending" ? (
        <Ending scenario={scenario} run={run} onReplay={() => update(null)} />
      ) : (
        <SceneView
          scenario={scenario}
          run={run}
          onChoose={(i) => update(choose(scenario, run, i))}
        />
      )}
    </div>
  );
}

function Intro({ scenario, onStart }: { scenario: Scenario; onStart: () => void }) {
  return (
    <Card accent="pink">
      <p className="text-xs font-semibold uppercase tracking-widest text-pink">
        Peranmu: {scenario.perspective}
      </p>
      <p className="mt-3 text-lg leading-relaxed">{scenario.intro}</p>
      <p className="mt-4 rounded-xl border border-border p-3 text-sm text-muted">
        {scenario.disclaimer}
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-pink px-5 text-sm font-semibold text-bg hover:bg-pink/85"
      >
        Mulai simulasi
      </button>
    </Card>
  );
}

function SceneView({
  scenario,
  run,
  onChoose,
}: {
  scenario: Scenario;
  run: RunState;
  onChoose: (index: number) => void;
}) {
  const node = currentNode(scenario, run);
  if (node.type !== "scene") return null;
  const last = run.path.at(-1);
  const choices = choicesFor(scenario, run);

  return (
    <Card accent="pink">
      <p className="text-xs text-muted">Langkah {run.path.length + 1}</p>
      <MeterBars scenario={scenario} meters={run.meters} deltas={last?.deltas} />

      {last?.outcome && (
        <p
          className="mt-5 rounded-lg border border-pink/40 bg-pink/5 px-3 py-2 text-sm"
          aria-live="polite"
        >
          Yang terjadi: <strong>{last.outcome}</strong>
        </p>
      )}

      {node.title && <h2 className="mt-6 text-2xl font-bold tracking-tight">{node.title}</h2>}
      <p className="mt-3 text-lg leading-relaxed">{node.text}</p>

      <fieldset className="mt-6">
        <legend className="mb-3 text-sm text-muted">Apa yang kamu lakukan?</legend>
        <ul className="grid gap-2">
          {choices.map((c) => (
            <li key={c.index}>
              <button
                type="button"
                disabled={!c.enabled}
                onClick={() => onChoose(c.index)}
                aria-describedby={c.enabled ? undefined : `locked-${c.index}`}
                className="w-full rounded-xl border border-border px-4 py-3 text-left transition-colors enabled:hover:border-pink enabled:hover:bg-surface-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="font-semibold">
                  {!c.enabled && <span aria-hidden>🔒 </span>}
                  {c.label}
                </span>
                {c.outcomes && (
                  <span className="mt-1 block text-xs text-muted">
                    Hasil tidak pasti:{" "}
                    {c.outcomes.map((o) => `~${o.percent}% ${o.label.toLowerCase()}`).join(" · ")}
                  </span>
                )}
                {!c.enabled && c.lockedReason && (
                  <span id={`locked-${c.index}`} className="mt-1 block text-xs text-muted">
                    {c.lockedReason}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </fieldset>
      {choices.some((c) => c.outcomes) && (
        <p className="mt-3 text-xs text-muted">{scenario.probabilityNote}</p>
      )}
    </Card>
  );
}

function Ending({
  scenario,
  run,
  onReplay,
}: {
  scenario: Scenario;
  run: RunState;
  onReplay: () => void;
}) {
  const node = currentNode(scenario, run) as EndingNode;
  const shareText = `Aku main "${scenario.title}" dan berakhir di: ${node.title}. Coba pilihanmu sendiri:\n${window.location.href.split("#")[0]}`;

  return (
    <div className="grid gap-4">
      <Card accent="pink">
        <p className="text-xs font-semibold uppercase tracking-widest text-pink">Akhir ceritamu</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight" data-testid="ending-title">
          {node.title}
        </h2>
        <p className="mt-3 text-lg leading-relaxed">{node.text}</p>
        <p className="mt-4 border-l-2 border-pink pl-3 italic">{node.reflection}</p>
        {(node.winners || node.losers) && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {node.winners && (
              <WhoList title="Siapa yang diuntungkan" icon="↑" items={node.winners} />
            )}
            {node.losers && <WhoList title="Siapa yang menanggung" icon="↓" items={node.losers} />}
          </div>
        )}
        <div className="mt-6">
          <MeterBars scenario={scenario} meters={run.meters} />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold">Jalan yang kamu pilih</h3>
        <ol className="mt-3 grid gap-2 text-sm">
          {run.path.map((step, i) => {
            const from = scenario.nodes[step.from];
            const label = from.type === "scene" ? from.choices[step.choiceIndex].label : "";
            return (
              <li key={i} className="flex gap-2">
                <span className="num text-muted">{i + 1}.</span>
                <span>
                  {label}
                  {step.outcome && <span className="text-muted"> → {step.outcome}</span>}
                </span>
              </li>
            );
          })}
        </ol>
      </Card>

      <Card accent="pink">
        <h3 className="font-semibold">Kisah aslinya</h3>
        <ul className="mt-3 grid gap-2 text-sm">
          {scenario.realStory.map((r) => (
            <li key={r.url}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-pink"
              >
                {r.title}
              </a>{" "}
              <span className="text-muted">· {r.publisher}</span>
            </li>
          ))}
        </ul>

        <h3 className="mt-6 font-semibold">Ambil tindakan</h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {scenario.actions.map((a) => (
            <li key={a.url}>
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track({ name: "action_link_clicked", props: { slug: scenario.slug, org: a.org } })
                }
                className="block h-full rounded-xl border border-border p-4 transition-colors hover:border-pink hover:bg-surface-strong"
              >
                <span className="font-semibold">{a.label} ↗</span>
                <span className="mt-1 block text-xs text-muted">{a.description}</span>
              </a>
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onReplay}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-semibold hover:bg-surface-strong"
        >
          Main lagi dengan pilihan berbeda
        </button>
        <ShareButton text={shareText} label="Bagikan akhir ceritaku" />
      </div>
    </div>
  );
}

function WhoList({ title, icon, items }: { title: string; icon: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-sm font-semibold">
        <span aria-hidden>{icon} </span>
        {title}
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
        {items.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    </div>
  );
}
