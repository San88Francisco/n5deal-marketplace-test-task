/** Shared between the edge middleware and the Node-only session module, so the
 *  middleware never has to import `server-only` code (or node:crypto). */
export const SESSION_COOKIE = "n5deal_session";
