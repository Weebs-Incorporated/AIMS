import {
    Source,
    ArtStyle,
    ExplicitLevel,
    HairLengths,
    LightLevel,
    Outfits,
    Races,
    ShotType,
    Themes,
    Colours,
} from './Attributes';

export interface Post {
    /** Normally the uploaded file name. */
    id: string;

    metaData: {
        /** Uploaded at ISO string. */
        uploaded: string;
        /** Last modified ISO string. */
        modified: string | null;
        /** Uploader ID. */
        uploader: string;
        /** Modifier ID. */
        modifier: string | null;
    };

    /** Values are in pixels. */
    dimensions: {
        width: number;
        height: number;
    };

    /** Links to this post and it's uploader. */
    sources: { [k in Source]: { post: string; account: string } };

    /** Array of post ID's that were uploaded with this image. */
    accompanyingImages: string[];

    /**
     * The (main) universe the post belongs to.
     *
     * Normally this will be the name of a series or game.
     *
     * @example "arknights", "konosuba", "re:zero", "overwatch"
     *
     * Can be `undefined` if unknown (should never permanently be this however).
     *
     * Can be `null` if the universe is an original.
     */
    universe: string | null | undefined;

    /** Might not be in English. */
    artistName: string;

    /** Names of any noteworthy figures in the post. */
    characters: string[];

    artStyle: ArtStyle;

    explicitLevel: ExplicitLevel;

    hairLengths: HairLengths | null;

    lightLevel: LightLevel;

    outfits: Outfits | null;

    races: Races | null;

    shotType: ShotType;

    themes: Themes;

    hairColours: Colours | null;

    eyeColours: Colours | null;
}
