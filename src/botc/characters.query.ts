import { queryOptions } from "@tanstack/react-query";
import z from "zod";
import { type Character, JsonCharacter } from "./characters";

export async function fetchCharacters(): Promise<Character[]> {
    const data = await fetch("/data/roles.json");

    return z.array(JsonCharacter).parse(await data.json());
}

export const charactersQueryOptions = queryOptions({
    queryKey: ["characters"],
    queryFn: fetchCharacters,
});
