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
import { PostStatus } from './PostStatus';

export interface Post<T extends PostStatus> {
    /** Normally the uploaded file name. */
    _id: string;

    url: string;

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

    /** Size in bytes. */
    size: number;

    status: T;

    /** Links to this post this image is in and it's author. */
    sources: { [k in Source]?: { post: string; account: string } };

    /** Array of post ID's that were uploaded with this image. */
    accompanyingImages: string[];

    /**
     * The (main) universe the post belongs to.
     *
     * Normally this will be the name of a series or game.
     *
     * Can be `undefined` if unknown (should never permanently be this however).
     *
     * Can be `null` if the universe is an original.
     *
     * @example "arknights", "konosuba", "re:zero", "overwatch"
     */
    universe: string | null | undefined;

    /** Might not be in English. */
    artistName: string;

    /** Names of any noteworthy figures in the post. */
    characters: string[];

    artStyle: ArtStyle;

    explicitLevel: ExplicitLevel;

    hairLengths: HairLengths;

    lightLevel: LightLevel;

    outfits: Outfits;

    races: Races;

    shotType: ShotType;

    themes: Themes;

    hairColours: Colours;

    eyeColours: Colours;
}
