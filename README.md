# Novu Rest Client for JS

A third-party library for invoking the REST APIs of Novu

(_still a work-in-progress_)

### Motivation

This is an open-source project that aims to provide wider compatibility to other non-node JS runtime.

#### Use case(s)

- Use on cloudflare workers - Since cloudflare workers do not natively run on Node runtime, `@novu/node` is not usable, mostly due to its use of `axios`. To solve this, we use `fetch()` for performing requests.

## Install as dependency

```shell
npm i @cystain/novu-rest-js
```

## Usage

```js
import { NovuRestClient } from '@cystain/novu-rest-js/lib/restClient';

const novuRestClient = new NovuRestClient('<YOUR_NOVU_API_KEY>');

// Sample trigger request (Trigger Event)
await novuRestClient.trigger('<WORKFLOW_TRIGGER_ID>', {
  to: {
    subscriberId: '<SUBSCRIBER_ID>',
  },
  payload: {
    title: 'Notif title',
    body: 'Notif body',
    link: 'http://example.com',
  },
  overrides: {
    fcm: {
      type: 'data',
    },
  },
});
```

For the request specifications, refer to the REST API doc: https://docs.novu.co/api-reference/events/trigger-event
