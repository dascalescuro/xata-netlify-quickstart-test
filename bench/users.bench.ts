import { bench, describe, vi } from "vitest";
import type { Context } from "@netlify/functions";

type UserRow = Record<string, unknown>;

// The handler queries Neon/Xata over the network. To keep the benchmarks
// deterministic, the database client is replaced with an in-memory fake that
// returns pre-built rows, so only the function's own work is measured
// (client creation, query building and JSON response serialization).
let rows: UserRow[] = [];

vi.mock("@neondatabase/serverless", () => ({
  neon: () => async (_strings: TemplateStringsArray, ..._values: unknown[]) =>
    rows,
}));

const { default: handler, config } = await import("../netlify/functions/users");

process.env.DATABASE_URL ??= "postgresql://user:password@localhost/db";

const makeUsers = (count: number, extraFields = 0): UserRow[] =>
  Array.from({ length: count }, (_, i) => {
    const user: UserRow = {
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      created_at: new Date(Date.UTC(2024, 0, 1 + (i % 28))).toISOString(),
      active: i % 2 === 0,
    };
    for (let f = 0; f < extraFields; f++) {
      user[`field_${f}`] = `value ${f} for user ${i + 1}`;
    }
    return user;
  });

const scenarios = {
  "10 users": makeUsers(10),
  empty: [] as UserRow[],
  "10 users, 50 extra columns": makeUsers(10, 50),
};

const request = new Request(`https://example.netlify.app${config.path}`);
const context = {} as Context;

// Exercise the Request/Response machinery before measuring so that one-time
// lazy initialization is not attributed to whichever scenario runs first.
for (const data of Object.values(scenarios)) {
  rows = data;
  for (let i = 0; i < 50; i++) await (await handler(request, context)).text();
}

describe("GET /api/users", () => {
  for (const [name, data] of Object.entries(scenarios)) {
    bench(name, async () => {
      rows = data;
      const response = await handler(request, context);
      await response.text();
    });
  }
});
