import { type Character, getAlignmentStr } from "../botc/characters";

type PartialCharacter = {
    id: Character["id"];
    name: Character["name"];
    team: Character["team"];
    edition: Character["edition"];
};

export function CharacterView({ character }: { character: PartialCharacter }) {
    const alignment = getAlignmentStr(character.team);
    const color =
        (
            {
                townsfolk: "border-blue-400",
                outsider: "border-cyan-400",
                minion: "border-fuchsia-400",
                demon: "border-red-400",
            } as Record<string, string>
        )[character.team] ?? "border-slate-600";

    return (
        <div className="flex flex-col items-center gap-2 select-none">
            <div className={`rounded-full bg-slate-600 ${color} border-3 overflow-hidden w-20`}>
                <img
                    src={`/characters/${character.edition}/${character.id}${alignment ? "_" : ""}${alignment}.webp`}
                    className={"min-w-100% min-h-100%"}
                />
            </div>
            <div className="w-full font-goudy text-md text-center truncate">{character.name}</div>
        </div>
    );
}
