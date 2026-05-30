import { useEffect, useMemo, useState } from "react";
import z from "zod";
import allCharactersRaw from "./resources/data/roles.json";

const excludedCharacterIds = [
    "atheist",
    "engineer",
    "pithag",
    "heretic",
    "legion",
    "drunk",
    "lunatic",
    "marionette",
    "summoner",
    "lordoftyphon",
];

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

function getRandomFromSequence<T>(seq: T[], exclude: T[]) {
    while (true) {
        const i = getRandomInt(seq.length);
        if (exclude.includes(seq[i])) continue;
        return seq[i];
    }
}

const playerCounts: Record<number, { townsfolk: number; outsider: number; minion: number; demon: number }> = {
    5: { townsfolk: 3, outsider: 0, minion: 1, demon: 1 },
    6: { townsfolk: 3, outsider: 1, minion: 1, demon: 1 },
    7: { townsfolk: 5, outsider: 0, minion: 1, demon: 1 },
    8: { townsfolk: 5, outsider: 1, minion: 1, demon: 1 },
    9: { townsfolk: 5, outsider: 2, minion: 1, demon: 1 },
    10: { townsfolk: 7, outsider: 0, minion: 2, demon: 1 },
    11: { townsfolk: 7, outsider: 1, minion: 2, demon: 1 },
    12: { townsfolk: 7, outsider: 2, minion: 2, demon: 1 },
    13: { townsfolk: 9, outsider: 0, minion: 3, demon: 1 },
    14: { townsfolk: 9, outsider: 1, minion: 3, demon: 1 },
    15: { townsfolk: 9, outsider: 2, minion: 3, demon: 1 },
};

const JsonCharacter = z.object({
    id: z.string(),
    name: z.string(),
    team: z.enum(["townsfolk", "outsider", "minion", "demon", "traveller", "fabled", "loric"]),
    edition: z.enum(["carousel", "tb", "bmr", "snv", "fabled", "loric"]),
    firstNightReminder: z.string().optional(),
    reminders: z.array(z.string()),
    setup: z.boolean(),
    ability: z.string(),
    flavor: z.string(),
});
type Character = z.infer<typeof JsonCharacter>;

function getAlignmentStr(character: Character) {
    switch (character.team) {
        case "townsfolk":
        case "outsider":
            return "g";

        case "minion":
        case "demon":
            return "e";

        case "traveller":
        case "fabled":
        case "loric":
            return "";
    }
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
    const [choices, setChoices] = useState<Character[]>([]);

    useEffect(() => {
        if (!allCharacters) return;

        const possibles = allCharacters.filter((c) => c.team === player.team);

        const c: Character[] = [];
        while (c.length < 3) {
            c.push(getRandomFromSequence(possibles, c));
        }

        setChoices(c);
    }, [allCharacters]);

    const mulligan = () => {
        const c: Character[] = [];
        const possibles = allCharacters.filter((c) => c.team === player.team);
        const num = Math.max(1, choices.length - 1);
        while (c.length < num) {
            c.push(getRandomFromSequence(possibles, c));
        }

        setChoices(c);
    };

    const reroll = (index: number) => {
        const possibles = allCharacters.filter((c) => c.team === player.team);
        setChoices(choices.map((c, i) => (index !== i ? c : getRandomFromSequence(possibles, choices))));
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
            {choices.map((c, i) => (
                <div onClick={() => reroll(i)} className="cursor-pointer" key={i}>
                    <CharacterView character={c} />
                </div>
            ))}
        </div>
    );
}

function App() {
    const [numPlayers, setNumPlayers] = useState(12);
    const [sent, setSent] = useState(0);
    const [mario, setMario] = useState(false);
    const [drunk, setDrunk] = useState(false);
    const [lunatic, setLunatic] = useState(false);
    const [players, setPlayers] = useState<Player[]>([]);

    const { data: allCharacters, error } = useMemo(() => {
        const ret = z.array(JsonCharacter).safeParse(allCharactersRaw);
        if (ret.success) {
            ret.data = ret.data.filter((c) => !excludedCharacterIds.includes(c.id));
        }
        return ret;
    }, []);

    const buildBag = () => {
        if (!allCharacters) return;
        const prefix = Math.random().toString(36).slice(2, 10);

        const playerCount = { ...playerCounts[numPlayers] };

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

    if (error) return <div>{z.prettifyError(error)}</div>;

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

export default App;
