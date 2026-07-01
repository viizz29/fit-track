import { setupWorker } from "msw/browser";
import { handlers as authHandlers } from "./auth-handlers";

export const worker = setupWorker(...authHandlers);
