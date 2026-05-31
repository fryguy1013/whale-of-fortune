import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div>
            <Link to="/classic" className="block py-1 text-blue-600">
                Whale of Fortune Generator (Classic)
            </Link>
        </div>
    );
}
