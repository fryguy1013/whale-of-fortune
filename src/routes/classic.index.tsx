import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { charactersQueryOptions } from "../botc/characters.query";
import { type CharacterType, calculatePlayerCounts, calculatePlayersList } from "../botc/gamesize";
import { CharacterView } from "../components/character-token";
import { Header } from "../components/header";
import { SelectCharacters } from "../components/select-characters";
import { excludedCharacters } from "../state";

export const Route = createFileRoute("/classic/")({
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(charactersQueryOptions),
    component: RouteComponent,
});

const tokensForCharacterType: Record<CharacterType, any> = {
    townsfolk: { id: "townsfolk", name: "Townsfolk", team: "townsfolk", edition: "generic" },
    outsider: { id: "outsider", name: "Outsider", team: "outsider", edition: "generic" },
    minion: { id: "minion", name: "Minion", team: "minion", edition: "generic" },
    demon: { id: "demon", name: "Demon", team: "demon", edition: "generic" },
};

function RouteComponent() {
    const allCharacters = useSuspenseQuery(charactersQueryOptions).data;
    const excludedCharacterIds = useAtomValue(excludedCharacters);
    const navigate = useNavigate();
    const [numPlayers, setNumPlayers] = useState(12);
    const [sent, setSent] = useState(0);
    const [mario, setMario] = useState(false);
    const [drunk, setDrunk] = useState(false);
    const [lunatic, setLunatic] = useState(false);
    const [showCharacters, setShowCharacters] = useState(false);

    const buildBag = () => {
        navigate({
            to: "/classic/characters",
            search: {
                numPlayers,
                mario,
                drunk,
                lunatic,
                sent,
            },
        });
    };

    const playerCount = calculatePlayerCounts({ numPlayers, mario, drunk, lunatic, sent });

    const allowedCharacters = allCharacters.filter((c) => !excludedCharacterIds.includes(c.id));
    const errors = [];
    if (playerCount === undefined) errors.push("Invalid player count");
    else if (playerCount.townsfolk < 0) errors.push("Cannot have a negative number of townsfolk");
    else if (playerCount.outsider < 0) errors.push("Cannot have a negative number of outsiders");
    else if (allowedCharacters.filter((c) => c.team === "townsfolk").length < 6)
        errors.push("Not enough townsfolk characters to choose from");
    else if (allowedCharacters.filter((c) => c.team === "outsider").length < 6)
        errors.push("Not enough outsider characters to choose from");
    else if (allowedCharacters.filter((c) => c.team === "minion").length < 6)
        errors.push("Not enough minion characters to choose from");
    else if (allowedCharacters.filter((c) => c.team === "demon").length < 6)
        errors.push("Not enough demon characters to choose from");

    const buttonAllowed = errors.length === 0;
    const playersList =
        playerCount !== undefined ? calculatePlayersList(playerCount).map((c) => tokensForCharacterType[c]) : undefined;

    return (
        <div className="flex flex-col w-full mx-auto">
            <Header />

            <div className="flex flex-col items-center mx-auto w-full">
                <div className="flex flex-col w-full py-4 items-center gap-2">
                    <h2 className="text-xl font-bold">Players:</h2>
                    <div className="grid grid-cols-5 sm:grid-cols-10 items-center sm:w-md w-full">
                        {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((num) => (
                            <button
                                key={num}
                                type="button"
                                className={`border border-slate-500 w-full ${num === 6 ? "rounded-tl-md" : num === 10 ? "rounded-tr-md" : num === 11 ? "rounded-bl-md" : num === 15 ? "rounded-br-md" : "rounded-none"} ${num === 6 ? "sm:rounded-l-md" : num === 15 ? "sm:rounded-r-md" : ""} p-1 ${numPlayers === num ? "bg-blue-200 text-black" : "bg-slate-800"}`}
                                onClick={() => setNumPlayers(num)}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                    <h2 className="text-xl font-bold">Outsiders:</h2>
                    <div className="flex flex-row mx-5 items-center sm:w-md w-full">
                        <button
                            type="button"
                            className={`border border-slate-500 w-full rounded-l-md mx-0 p-2 ${sent === -1 ? "bg-blue-200 text-black" : "bg-slate-800"}`}
                            onClick={() => setSent(-1)}
                        >
                            Sentinel -1
                        </button>
                        <button
                            type="button"
                            className={`border border-slate-500 w-full mx-0 p-2 ${sent === 0 ? "bg-blue-200 text-black" : "bg-slate-800"}`}
                            onClick={() => setSent(0)}
                        >
                            0
                        </button>
                        <button
                            type="button"
                            className={`border border-slate-500 w-full rounded-r-md mx-0 p-2 ${sent === 1 ? "bg-blue-200 text-black" : "bg-slate-800"}`}
                            onClick={() => setSent(1)}
                        >
                            Sentinel +1
                        </button>
                    </div>
                    <div className="flex flex-row mx-0 items-center sm:w-md w-full">
                        <button
                            type="button"
                            className={`flex flex-row border border-slate-500 w-full rounded-l-md mx-0 p-2 justify-center items-center ${lunatic ? "bg-blue-200 text-black" : "bg-slate-800"}`}
                            onClick={() => setLunatic(!lunatic)}
                        >
                            <img src="/characters/bmr/lunatic_g.webp" className="w-10 h-10 -m-2 mr-0" />
                            Lunatic
                        </button>

                        <button
                            type="button"
                            className={`flex flex-row border border-slate-500 w-full mx-0 p-2 justify-center items-center ${mario ? "bg-blue-200 text-black" : "bg-slate-800"}`}
                            onClick={() => setMario(!mario)}
                        >
                            <img src="/characters/carousel/marionette_e.webp" className="w-10 h-10 -m-2 mr-0" />
                            Marionette
                        </button>

                        <button
                            type="button"
                            className={`flex flex-row border border-slate-500 w-full rounded-r-md mx-0 p-2 justify-center items-center ${drunk ? "bg-blue-200 text-black" : "bg-slate-800"}`}
                            onClick={() => setDrunk(!drunk)}
                        >
                            <img src="/characters/tb/drunk_g.webp" className="w-10 h-10 -m-2 mr-0" />
                            Drunk
                        </button>
                    </div>
                    <hr className="border-slate-500 w-full sm:w-xl my-5" />
                    {playerCount === undefined || playersList === undefined ? (
                        <div>Invalid player count</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-4 sm:w-xl flex-wrap text-lg font-bold text-center items-center justify-center">
                                <div className="w-full">Townsfolk: {playerCount.townsfolk}</div>
                                <div className="w-full">Outsider: {playerCount.outsider}</div>
                                <div className="w-full">Minion: {playerCount.minion}</div>
                                <div className="w-full">Demon: {playerCount.demon}</div>
                            </div>
                            <div className="flex sm:w-xl w-full flex-row flex-wrap justify-center items-center gap-2">
                                {playersList.map((c, i) => (
                                    <div className="w-20" key={i}>
                                        <CharacterView character={c} />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    <hr className="border-slate-500 w-full sm:w-xl m-2" />
                    <div className="flex flex-row mx-0 items-center sm:w-md w-full">
                        <button
                            type="button"
                            className={`w-auto flex flex-row border border-slate-500 w-full rounded-r-md mx-0 p-2 justify-center items-center ${showCharacters ? "bg-blue-200 text-black" : "bg-slate-800"}`}
                            onClick={() => setShowCharacters(!showCharacters)}
                        >
                            Customize Characters
                        </button>
                    </div>

                    {showCharacters && <SelectCharacters allCharacters={allCharacters} />}

                    <button
                        type="button"
                        className={`sm:w-md w-full text-3xl flex flex-row border border-slate-500 rounded-md my-4 mx-0 p-4 items-center justify-center bg-green-800 ${buttonAllowed ? "" : "opacity-50 cursor-not-allowed"}`}
                        onClick={() => {
                            if (buttonAllowed) buildBag();
                        }}
                    >
                        🚀 Build Bag
                    </button>
                    {!buttonAllowed && <div className="text-xl text-yellow-500">⚠️ {errors.join(", ")}</div>}
                </div>
            </div>
        </div>
    );
}
