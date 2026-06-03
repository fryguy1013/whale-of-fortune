import { Link } from "@tanstack/react-router";

export function Header() {
    return (
        <div className="flex flex-row bg-slate-700 w-full px-10 py-5 justify-between">
            <Link to="/">
                <div className="flex flex-col">
                    <h2 className="text-4xl font-bold flex-grow">Whale of Fortune Generator</h2>
                    <div className="text-sm">(fan made content, not associated with The Pandemonium Institute)</div>
                </div>
            </Link>
            <img src="/community/ccc-parchment.png" className="h-15" />
        </div>
    );
}
