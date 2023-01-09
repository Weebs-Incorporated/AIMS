export enum PostStatus {
    /**
     * Default status for newly uploaded posts, here they must be checked by a user with the audit permission
     * before going public.
     */
    InitialAwaitingValidation,

    /** Visible to all. */
    Public,

    /** Withdrawn manually due to an issue, posts with this state should eventually be made public again, or deleted. */
    ReAwaitingValidation,
}
