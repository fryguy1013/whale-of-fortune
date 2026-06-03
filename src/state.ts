import { atomWithStorage } from "jotai/utils";


export const defaultExcludedCharacterIds = [
    "atheist",
    "baron",
    "engineer",
    "heretic",
    "kazali",
    "legion",
    "lordoftyphon",
    "pithag",
    "summoner",
    "drunk",
    "lunatic",
    "marionette",
];

export const excludedCharacters = atomWithStorage<string[]>("validCharacters", defaultExcludedCharacterIds);
