import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { charactersQueryOptions } from "../botc/characters.query";
import { type CharacterType, calculatePlayerCounts, calculatePlayersList } from "../botc/gamesize";
import { CharacterView } from "../components/character-token";
import { Header } from "../components/header";
import { SelectCharacters } from "../components/select-characters";

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

    const buttonAllowed = playerCount !== undefined && playerCount.townsfolk > 0 && playerCount.outsider >= 0;
    const playersList =
        playerCount !== undefined ? calculatePlayersList(playerCount).map((c) => tokensForCharacterType[c]) : undefined;

    return (
        <div className="flex flex-col w-full mx-auto">
            <Header />

            <div className="flex flex-col items-center mx-auto w-full">
                <div className="flex flex-col w-full p-4 items-center gap-2">
                    <h2 className="text-xl font-bold">Players:</h2>
                    <div className="flex flex-row mx-5 items-center w-md">
                        {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((num) => (
                            <button
                                key={num}
                                type="button"
                                className={`border border-slate-500 w-full ${num === 6 ? "rounded-l-md" : num === 15 ? "rounded-r-md" : ""} mx-0 p-2 ${numPlayers === num ? "bg-blue-200 text-black" : "bg-slate-800"}`}
                                onClick={() => setNumPlayers(num)}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                    <h2 className="text-xl font-bold">Outsiders:</h2>
                    <div className="flex flex-row mx-5 items-center w-md">
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
                    <div className="flex flex-row mx-0 items-center w-md">
                        <button
                            type="button"
                            className={`w-auto flex flex-row border border-slate-500 w-full rounded-l-md mx-0 p-2 justify-center items-center ${lunatic ? "bg-blue-200 text-black" : "bg-slate-800"}`}
                            onClick={() => setLunatic(!lunatic)}
                        >
                            <img src="/characters/bmr/lunatic_g.webp" className="w-10 h-10 -m-2 mr-0" />
                            Lunatic
                        </button>

                        <button
                            type="button"
                            className={`w-auto flex flex-row border border-slate-500 w-full mx-0 p-2 justify-center items-center ${mario ? "bg-blue-200 text-black" : "bg-slate-800"}`}
                            onClick={() => setMario(!mario)}
                        >
                            <img src="/characters/carousel/marionette_e.webp" className="w-10 h-10 -m-2 mr-0" />
                            Marionette
                        </button>

                        <button
                            type="button"
                            className={`w-auto flex flex-row border border-slate-500 w-full rounded-r-md mx-0 p-2 justify-center items-center ${drunk ? "bg-blue-200 text-black" : "bg-slate-800"}`}
                            onClick={() => setDrunk(!drunk)}
                        >
                            <img src="/characters/tb/drunk_g.webp" className="w-10 h-10 -m-2 mr-0" />
                            Drunk
                        </button>
                    </div>
                    <hr className="border-slate-500 w-full m-5" />
                    {playerCount === undefined || playersList === undefined ? (
                        <div>Invalid player count</div>
                    ) : (
                        <>
                            <div className="flex flex-row gap-10 text-lg font-bold">
                                <div>Townsfolk: {playerCount.townsfolk}</div>
                                <div>Outsider: {playerCount.outsider}</div>
                                <div>Minion: {playerCount.minion}</div>
                                <div>Demon: {playerCount.demon}</div>
                            </div>
                            <div className="flex w-2xl flex-row flex-wrap justify-center items-center gap-2">
                                {playersList.map((c, i) => (
                                    <div className="w-20" key={i}>
                                        <CharacterView character={c} />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    <hr className="border-slate-500 w-full m-2" />
                    <div className="flex flex-row mx-0 items-center w-md">
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
                        className={`w-auto text-3xl flex flex-row border border-slate-500 w-30 rounded-md my-4 mx-0 p-4 items-center bg-green-800 ${buttonAllowed ? "" : "opacity-50 cursor-not-allowed"}`}
                        onClick={() => {
                            if (buttonAllowed) buildBag();
                        }}
                    >
                        🚀 Build Bag
                    </button>
                    {!buttonAllowed && <div className="text-xl text-yellow-500">⚠️ Invalid player count</div>}
                </div>
            </div>
        </div>
    );
}
