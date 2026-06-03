import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="flex flex-col w-full mx-auto items-center p-4 text-slate-300">
            <h3 className="text-7xl font-bold text-blue-600 m-6">fryguy's BotC Tools</h3>
            <p className="w-md text-justify">
                This is a collection of tools for running the games of Blood on the Clocktower. It is fan made content,
                and not associated with The Pandemonium Institute.
            </p>

            <Link
                to="/classic"
                className="flex flex-col py-1 text-blue-100 my-10 w-60 p-2 aspect-square bg-slate-500 font-bold
                        rounded-lg items-center justify-center border-2 border-slate-00 relative before:absolute
                        before:inset-0 before:bg-linear-to-b before:from-white/20
                        before:to-transparent inset-shadow-2xs inset-shadow-neutral-700"
            >
                <div className="text-7xl my-5">🐳🥠</div>
                <div>Whale of Fortune Generator</div>
                <div>(Classic)</div>
            </Link>

            <p className="w-md text-justify">
                Whale of Fortune is a homebrew script for Blood on the Clocktower that allows players to choose from a
                set of three characters at the start of the game instead of being chosen by the storyteller.
            </p>
        </div>
    );
}
