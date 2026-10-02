# xata-netlify-quickstart-test

[![CodSpeed](https://img.shields.io/endpoint?url=https://codspeed.io/badge.json)](https://app.codspeed.io/dascalescuro/xata-netlify-quickstart-test?utm_source=badge)

Netlify function (`/api/users`) backed by a Xata Postgres database through `@neondatabase/serverless`.

## Benchmarks

Benchmarks live in `bench/` and run with [Vitest](https://vitest.dev/guide/features.html#benchmarking) and the [CodSpeed plugin](https://codspeed.io/docs/benchmarks/nodejs/vitest). The database client is replaced with an in-memory fake, so no database connection is needed.

```sh
npm run bench
```
