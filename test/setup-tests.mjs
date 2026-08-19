import { register } from "node:module";

// Regista o tsx (transpila TS) e, a seguir, o nosso loader que resolve
// "server-only" para um módulo vazio — necessário fora do ambiente Next.js.
await import("tsx");
register("./server-only-loader.mjs", import.meta.url);
