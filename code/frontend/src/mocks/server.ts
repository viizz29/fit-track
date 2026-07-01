import { setupServer } from "msw/node";
import { handlers as authHandlers } from "./auth-handlers";

export const server = setupServer(...authHandlers);
