import z from "zod";

export const JsonCharacter = z.object({
    id: z.string(),
    name: z.string(),
    team: z.enum(["townsfolk", "outsider", "minion", "demon", "traveller", "fabled", "loric"]),
    edition: z.enum(["carousel", "tb", "bmr", "snv", "fabled", "loric"]),
    firstNightReminder: z.string().optional(),
    reminders: z.array(z.string()),
    setup: z.boolean(),
    ability: z.string(),
    flavor: z.string(),
});
export type Character = z.infer<typeof JsonCharacter>;

export function getAlignmentStr(character: Character) {
    switch (character.team) {
        case "townsfolk":
        case "outsider":
            return "g";

        case "minion":
        case "demon":
            return "e";

        case "traveller":
        case "fabled":
        case "loric":
            return "";
    }
}
