import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    component: RootComponent,
});

function RootComponent() {
    return (
        <div className="flex flex-col max-w-screen-lg items-center mx-auto">
            {/* <div className="flex flex-row bg-slate-700 w-full px-10 py-5 space place-content-between">
                <div className="flex flex-col">
                    <h2 className="text-5xl font-bold">Whale of Fortune Generator</h2>
                    <div className="text-sm">(fan made content, not associated with The Pandemonium Institute)</div>
                </div>
                <img src="/community/ccc-parchment.png" className="h-15" />
            </div> */}

            <Outlet />
        </div>
    );
}
