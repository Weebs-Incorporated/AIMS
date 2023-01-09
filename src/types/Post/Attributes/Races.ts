export enum Races {
    Human = 1 << 0,

    /**
     * Blanket term for any animal-like features.
     *
     * Use this alongside other races, and by itself you cannot distinguish.
     */
    Kemonomimi = 1 << 1,

    Fox = 1 << 2,

    Cat = 1 << 3,

    Dog = 1 << 4,

    Raccoon = 1 << 5,

    Dragon = 1 << 6,

    Elf = 1 << 7,

    Lizard = 1 << 8,

    Oni = 1 << 9,

    Angel = 1 << 10,
}
