import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { type Character, getAlignmentStr } from "../botc/characters";
import { charactersQueryOptions } from "../botc/characters.query";
import { getPlayerCountsForGameSize } from "../botc/gamesize";

// document.querySelector("input[placeholder=Search]").value = "${role}";
// document.querySelector("input[placeholder=Search]").dispatchEvent(new Event("input", { bubbles: true }));
// document.querySelector("input[placeholder=Search]").dispatchEvent(new Event("input", { bubbles: true }));

const excludedCharacterIds = [
    "atheist",
    "baron",
    "engineer",
    "heretic",
    "kazali",
    "legion",
    "lordoftyphon",
    "pithag",
    "summoner",
    "drunk",
    "lunatic",
    "marionette",
];

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

function CharacterView({ character }: { character: Character }) {
    const alignment = getAlignmentStr(character);
    const color =
        (
            {
                townsfolk: "bg-blue-950",
                outsider: "bg-cyan-900",
                minion: "bg-fuchsia-950",
                demon: "bg-red-950",
            } as Record<string, string>
        )[character.team] ?? "bg-slate-600";

    return (
        <div className="flex flex-col items-center my-2 w-28">
            <img
                src={`/characters/${character.edition}/${character.id}${alignment ? "_" : ""}${alignment}.webp`}
                className={`rounded-full ${color} border-2 border-white w-20 h-20`}
            />
            <div className="font-goudy text-md text-center truncate">{character.name}</div>
        </div>
    );
}

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
        <div className="flex flex-row items-center flex-grow bg-slate-700 border-b-1 border-white">
            <div className="flex flex-col items-end w-30">
                <div className="text-center">{player.name}</div>
                <button
                    type="button"
                    className={"text-xl border border-slate-500 w-auto rounded-md m-0 p-1 bg-slate-800"}
                    onClick={mulligan}
                >
                    🎲
                </button>
            </div>
            {choices.current.map((c, i) => (
                <div onClick={() => reroll(i)} className="cursor-pointer" key={i}>
                    <CharacterView character={c} />
                </div>
            ))}
        </div>
    );
}

export const Route = createFileRoute("/classic")({
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(charactersQueryOptions),
    component: RouteComponent,
});

function RouteComponent() {
    const [numPlayers, setNumPlayers] = useState(12);
    const [sent, setSent] = useState(0);
    const [mario, setMario] = useState(false);
    const [drunk, setDrunk] = useState(false);
    const [lunatic, setLunatic] = useState(false);
    const [players, setPlayers] = useState<Player[]>([]);
    const charactersQuery = useSuspenseQuery(charactersQueryOptions);

    const allCharacters = useMemo(() => {
        return charactersQuery.data?.filter((c) => !excludedCharacterIds.includes(c.id));
    }, [charactersQuery]);

    const buildBag = () => {
        if (!allCharacters) return;
        const prefix = Math.random().toString(36).slice(2, 10);

        const playerCount = getPlayerCountsForGameSize(numPlayers);
        if (!playerCount) return;

        if (mario) {
            playerCount.minion--;
            playerCount.townsfolk++;
        }
        if (drunk) {
            playerCount.outsider--;
            playerCount.townsfolk++;
        }
        if (lunatic) {
            playerCount.outsider--;
            playerCount.demon++;
        }
        if (sent === 1) {
            playerCount.outsider++;
            playerCount.townsfolk--;
        }
        if (sent === -1) {
            playerCount.outsider--;
            playerCount.townsfolk++;
        }

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

    //if (error) return <div>{z.prettifyError(error)}</div>;

    return (
        <div className="flex flex-col max-w-screen-lg items-center mx-auto">
            <div className="flex flex-row bg-slate-700 w-full p-10 space place-content-between">
                <div className="flex flex-col">
                    <h2 className="text-5xl font-bold">Whale of Fortune Generator</h2>
                    <div className="text-sm">(fan made content, not associated with The Pandemonium Institute)</div>
                </div>
                <img src="/community/ccc-parchment.png" className="h-15" />
            </div>
            <div className="flex bg-slate-800 w-full p-4 items-center gap-2">
                Players:
                <select
                    className="border bg-slate-800 border-slate-500 w-20 rounded-md mx-2 p-2"
                    value={numPlayers}
                    onChange={(e) => setNumPlayers(Number(e.target.value))}
                >
                    {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((num) => (
                        <option key={num} value={num}>
                            {num}
                        </option>
                    ))}
                </select>
                <div className="flex flex-row mx-5 items-center">
                    Sentinel:
                    <button
                        type="button"
                        className={`border border-slate-500 w-10 rounded-md mx-0 p-2 ${sent === -1 ? "bg-blue-200 text-black" : "bg-slate-800"}`}
                        onClick={() => setSent(-1)}
                    >
                        -1
                    </button>
                    <button
                        type="button"
                        className={`border border-slate-500 w-10 rounded-md mx-0 p-2 ${sent === 0 ? "bg-blue-200 text-black" : "bg-slate-800"}`}
                        onClick={() => setSent(0)}
                    >
                        0
                    </button>
                    <button
                        type="button"
                        className={`border border-slate-500 w-10 rounded-md mx-0 p-2 ${sent === 1 ? "bg-blue-200 text-black" : "bg-slate-800"}`}
                        onClick={() => setSent(1)}
                    >
                        +1
                    </button>
                </div>
                <div className="flex flex-row mx-0 items-center">
                    <button
                        type="button"
                        className={`w-auto flex flex-row border border-slate-500 w-30 rounded-md mx-0 p-2 items-center ${lunatic ? "bg-blue-200 text-black" : "bg-slate-800"}`}
                        onClick={() => setLunatic(!lunatic)}
                    >
                        <img src="/characters/bmr/lunatic_g.webp" className="w-10 h-10 -m-2 mr-0" />
                        Lunatic
                    </button>
                </div>
                <div className="flex flex-row mx-0 items-center">
                    <button
                        type="button"
                        className={`w-auto flex flex-row border border-slate-500 w-30 rounded-md mx-0 p-2 items-center ${mario ? "bg-blue-200 text-black" : "bg-slate-800"}`}
                        onClick={() => setMario(!mario)}
                    >
                        <img src="/characters/carousel/marionette_e.webp" className="w-10 h-10 -m-2 mr-0" />
                        Marionette
                    </button>
                </div>
                <div className="flex flex-row items-center w-auto">
                    <button
                        type="button"
                        className={`w-auto flex flex-row border border-slate-500 w-30 rounded-md mx-0 p-2 items-center ${drunk ? "bg-blue-200 text-black" : "bg-slate-800"}`}
                        onClick={() => setDrunk(!drunk)}
                    >
                        <img src="/characters/tb/drunk_g.webp" className="w-10 h-10 -m-2 mr-0" />
                        Drunk
                    </button>
                </div>
                <div className="flex flex-row mx-5 items-center w-auto">
                    <button
                        type="button"
                        className={
                            "w-auto flex flex-row border border-slate-500 w-30 rounded-md mx-0 p-2 items-center bg-green-800"
                        }
                        onClick={() => buildBag()}
                    >
                        🚀 Build Bag
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 w-full border-t-1 border-white">
                {players.length === 0 ? (
                    <div className="p-10 col-span-2 text-xl text-center">Build a bag to see results...</div>
                ) : (
                    players.map((p) => <PlayerView key={p.id} player={p} allCharacters={allCharacters} />)
                )}
            </div>
        </div>
    );
}
