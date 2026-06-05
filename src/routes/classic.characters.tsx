import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import type { Character } from "../botc/characters";
import { charactersQueryOptions } from "../botc/characters.query";
import { BagOptions, calculatePlayerCounts } from "../botc/gamesize";
import { CharacterView } from "../components/character-token";
import { Header } from "../components/header";
import { excludedCharacters } from "../state";

export const Route = createFileRoute("/classic/characters")({
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(charactersQueryOptions),
    component: RouteComponent,
    validateSearch: zodValidator(BagOptions),
});

// document.querySelector("input[placeholder=Search]").value = "${role}";
// document.querySelector("input[placeholder=Search]").dispatchEvent(new Event("input", { bubbles: true }));
// document.querySelector("input[placeholder=Search]").dispatchEvent(new Event("input", { bubbles: true }));

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

function getRandomFromSequence<T>(seq: T[], exclude: T[]): T | undefined {
    const remaining = seq.filter((c) => !exclude.includes(c));
    if (remaining.length === 0) return undefined;
    return remaining[getRandomInt(remaining.length)];
}

type Player = {
    id: string;
    name: string;
    team: Character["team"];
    character: Character | undefined;
};

function PlayerView({ player, allCharacters }: { player: Player; allCharacters: Character[] }) {
    const [choices, setChoices] = useState<{ current: Character[]; seen: Character[] }>({ current: [], seen: [] });

    useEffect(() => {
        if (!allCharacters) return;

        const possibles = allCharacters.filter((c) => c.team === player.team);

        const c: Character[] = [];
        while (c.length < 3) {
            const next = getRandomFromSequence(possibles, c);
            if (next === undefined) return;
            c.push(next);
        }

        setChoices({
            current: c,
            seen: c,
        });
    }, [allCharacters]);

    const mulligan = () => {
        const c: Character[] = [];
        const seen = [...choices.seen];
        const possibles = allCharacters.filter((c) => c.team === player.team);
        const num = Math.max(1, choices.current.length - 1);
        while (c.length < num) {
            const next = getRandomFromSequence(possibles, seen);
            if (next === undefined) return;
            c.push(next);
            seen.push(next);
        }

        setChoices({ current: c, seen });
    };

    const reroll = (index: number) => {
        const possibles = allCharacters.filter((c) => c.team === player.team);
        const current = [...choices.current];
        const seen = [...choices.seen];
        const next = getRandomFromSequence(possibles, seen);
        if (next === undefined) return;
        current[index] = next;
        seen.push(current[index]);
        setChoices({ current, seen });
    };

    return (
        <div className="flex flex-row items-center flex-grow bg-slate-900 border-b-0 border-white h-30">
            <button
                type="button"
                className={"text-xl border border-slate-500 w-auto rounded-md m-0 mb-5 p-1 bg-slate-800"}
                onClick={mulligan}
            >
                🎲
            </button>
            {choices.current.map((c, i) => (
                <div onClick={() => reroll(i)} className="w-25 cursor-pointer" key={i}>
                    <CharacterView character={c} />
                </div>
            ))}
        </div>
    );
}

function RouteComponent() {
    const navigate = useNavigate();
    const excludedCharacterIds = useAtomValue(excludedCharacters);
    const { numPlayers, mario, drunk, lunatic, sent } = Route.useSearch();
    const [players, setPlayers] = useState<Player[]>([]);
    const charactersQuery = useSuspenseQuery(charactersQueryOptions);

    const allCharacters = useMemo(() => {
        return charactersQuery.data?.filter((c) => !excludedCharacterIds.includes(c.id));
    }, [charactersQuery, excludedCharacterIds]);

    const buildBag = () => {
        if (!allCharacters) return;
        const prefix = Math.random().toString(36).slice(2, 10);

        const playerCount = calculatePlayerCounts({ numPlayers, mario, drunk, lunatic, sent });
        if (!playerCount) return;

        setPlayers(
            (["demon", "minion", "outsider", "townsfolk"] as const).flatMap((team) => {
                const count = playerCount[team] as number;
                return [...Array(count)].map(
                    (_, i) =>
                        ({
                            id: `${prefix}-${team}-${i}`,
                            name: `${team} ${i + 1}`,
                            team,
                            character: undefined,
                        }) as Player,
                );
            }),
        );
    };

    useEffect(() => {
        buildBag();
    }, [allCharacters, numPlayers, mario, drunk, lunatic, sent]);

    //if (error) return <div>{z.prettifyError(error)}</div>;

    return (
        <div className="flex flex-col w-full">
            <Header />

            <div className="flex flex-wrap bg-slate-800 w-full p-4 items-center gap-2">
                <button
                    type="button"
                    className={
                        "w-auto flex flex-row border border-slate-500 w-30 rounded-md mx-0 p-2 items-center bg-green-800"
                    }
                    onClick={() => navigate({ to: "/classic" })}
                >
                    🚀 Build New Bag
                </button>

                <button
                    type="button"
                    className={
                        "w-auto flex flex-row border border-slate-500 w-30 rounded-md mx-0 p-2 items-center bg-green-800"
                    }
                    onClick={() => buildBag()}
                >
                    🎲 Reroll
                </button>

                <a href="/whale-of-fortune-classic.json" download>
                    <button
                        type="button"
                        className={
                            "cursor-pointer w-auto flex flex-row border border-slate-500 w-30 rounded-md mx-0 p-2 items-center bg-slate-500"
                        }
                    >
                        🗒️ Download Script
                    </button>
                </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 w-full border-t-1 border-white py-3">
                {players.length === 0 ? (
                    <div className="p-10 col-span-2 text-xl text-center">Build a bag to see results...</div>
                ) : (
                    players.map((p) => <PlayerView key={p.id} player={p} allCharacters={allCharacters} />)
                )}
            </div>
        </div>
    );
}
