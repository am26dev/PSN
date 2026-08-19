import { pathToFileURL } from "node:url";

const STUB = pathToFileURL(
  new URL("./empty-server-only.js", import.meta.url).pathname,
).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") {
    return { url: STUB, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
