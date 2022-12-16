export enum UserPermissions {
    None = 0,

    /**
     * Change permissions of themselves and others.
     *
     * - Cannot remove this permission from themselves.
     * - Cannot modify permissions of other users who have this permission.
     */
    AssignPermissions = 1 << 0,

    /** Modify post attributes, delete any comments, and accept/deny/withdraw posts. */
    Audit = 1 << 1,

    /** Comment on posts (default permission). */
    Comment = 1 << 2,

    /** Submit posts (to be audited). */
    Upload = 1 << 3,

    /** Give/remove the {@link AssignPermissions} permission to other users, and view IPs. */
    Owner = 1 << 4,
}
