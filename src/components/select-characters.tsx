import { useAtom } from "jotai";
import { type Character, getAlignmentStr } from "../botc/characters";
import { defaultExcludedCharacterIds, excludedCharacters } from "../state";

export function SelectCharacters({ allCharacters }: { allCharacters: Character[] }) {
    const [excluded, setExcluded] = useAtom(excludedCharacters);

    const charactersByType = ["townsfolk", "outsider", "minion", "demon"].map((t) =>
        allCharacters.filter((c) => c.team === t).toSorted((a, b) => a.name.localeCompare(b.name)),
    );

    return (
        <>
            <div className="flex flex-row items-center justify-center w-full">
                <div className="flex flex-col items-center w-full">
                    <div className="text-xl font-bold">Characters</div>
                    <div className="text-sm">Select the characters you want to include in the random choices.</div>
                    <button
                        className="border border-slate-500 rounded-md m-0 p-2 bg-slate-800"
                        onClick={() => setExcluded(defaultExcludedCharacterIds)}
                    >
                        🔄️ Reset to default
                    </button>
                </div>
            </div>
            {charactersByType.map((characters) => (
                <div
                    key={characters[0].team}
                    className="grid grid-cols-2 md:grid-cols-4 w-full border-t-1 border-white"
                >
                    {characters.map((c) => (
                        <div
                            key={c.id}
                            className={`w-full flex flex-row items-center gap-1 select-none ${excluded.includes(c.id) ? "opacity-50 line-through" : ""}`}
                            onClick={() =>
                                setExcluded(
                                    excluded.includes(c.id) ? excluded.filter((x) => x !== c.id) : [...excluded, c.id],
                                )
                            }
                        >
                            <img
                                src={`/characters/${c.edition}/${c.id}${getAlignmentStr(c.team) ? "_" : ""}${getAlignmentStr(c.team)}.webp`}
                                className="size-10 -m-1"
                            />
                            <div className="block flex-grow text-lg overflow-hidden">{c.name}</div>
                        </div>
                    ))}
                </div>
            ))}
        </>
    );
}
