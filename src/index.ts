/**
 * Module Federation async boundary.
 *
 * Webpack needs the shared scope initialized before any shared module (React,
 * the router, the query client) is evaluated. A dynamic import creates that
 * boundary. Don't move the render call in here -- keep it in bootstrap.tsx.
 */
// `void` marks the floating promise as deliberately un-awaited: nothing can
// meaningfully await the entry point, and webpack only needs the dynamic
// import to exist to create the async boundary.
void import("./bootstrap");

export {};
