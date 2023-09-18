# Novu Rest Client for JS

A third-party library for invoking the REST APIs of Novu

### Motivation

This aims to provide wider compatibility to other non-node JS runtime.

#### Use case(s)

- Use on cloudflare workers - Since cloudflare workers do not natively run on Node runtime, `@novu/node` is not usable, mostly due to its use of `axios`. To solve this, we use `fetch()` for performing requests.
