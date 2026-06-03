import * as z from "zod";

export type CharacterType = "townsfolk" | "outsider" | "minion" | "demon";

export type GamePlayerCount = {
    townsfolk: number;
    outsider: number;
    minion: number;
    demon: number;
};

const playerCounts: Record<number, GamePlayerCount> = {
    5: { townsfolk: 3, outsider: 0, minion: 1, demon: 1 },
    6: { townsfolk: 3, outsider: 1, minion: 1, demon: 1 },
    7: { townsfolk: 5, outsider: 0, minion: 1, demon: 1 },
    8: { townsfolk: 5, outsider: 1, minion: 1, demon: 1 },
    9: { townsfolk: 5, outsider: 2, minion: 1, demon: 1 },
    10: { townsfolk: 7, outsider: 0, minion: 2, demon: 1 },
    11: { townsfolk: 7, outsider: 1, minion: 2, demon: 1 },
    12: { townsfolk: 7, outsider: 2, minion: 2, demon: 1 },
    13: { townsfolk: 9, outsider: 0, minion: 3, demon: 1 },
    14: { townsfolk: 9, outsider: 1, minion: 3, demon: 1 },
    15: { townsfolk: 9, outsider: 2, minion: 3, demon: 1 },
};

export function getPlayerCountsForGameSize(gameSize: number): GamePlayerCount | undefined {
    return { ...playerCounts[gameSize] };
}

export const BagOptions = z.object({
    numPlayers: z.number().min(6).max(15),
    mario: z.boolean(),
    drunk: z.boolean(),
    lunatic: z.boolean(),
    sent: z.number().min(-1).max(1),
});

export type CalculatePlayerCountsOptions = z.infer<typeof BagOptions>;

export function calculatePlayerCounts({
    numPlayers,
    mario,
    drunk,
    lunatic,
    sent,
}: CalculatePlayerCountsOptions): GamePlayerCount | undefined {
    const playerCount = getPlayerCountsForGameSize(numPlayers);
    if (!playerCount) return;

    if (mario) {
        playerCount.minion--;
        playerCount.townsfolk++;
    }
    if (drunk) {
        playerCount.outsider--;
        playerCount.townsfolk++;
    }
    if (lunatic) {
        playerCount.outsider--;
        playerCount.demon++;
    }
    if (sent === 1) {
        playerCount.outsider++;
        playerCount.townsfolk--;
    }
    if (sent === -1) {
        playerCount.outsider--;
        playerCount.townsfolk++;
    }

    return playerCount;
}

export function calculatePlayersList(playerCount: GamePlayerCount): CharacterType[] {
    return (["demon", "minion", "outsider", "townsfolk"] as const).flatMap((team) => {
        const count = playerCount[team] as number;
        if (count <= 0) return [];
        return [...Array(count)].map(() => team);
    });
}
