enum UserPermissions {
    None = 0,

    /** Change permissions of themselves and others (excluding this permission). */
    AssignPermissions = 1 << 0,

    /** Modify post attributes, delete any comments, and accept/deny/withdraw posts. */
    Audit = 1 << 1,

    /** Comment on posts (default permission). */
    Comment = 1 << 2,

    /** Submit posts (to be audited). */
    Upload = 1 << 3,
}

export default UserPermissions;
