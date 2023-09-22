import type { ITriggerPayloadOptions, ISubscriberPayload } from '@novu/node';

/**
 * The Novu Rest API Client
 */
export class NovuRestClient {
  private API_KEY: string | null = null;
  private API_BASE_URL: string = 'https://api.novu.co/v1';

  /**
   * @param apiKey the API Key of the Novu account
   */
  constructor(apiKey: string | undefined) {
    if (!apiKey) {
      throw new Error(`Invalid API Key: ${apiKey}`);
    }
    this.API_KEY = apiKey;
  }

  /**
   * Trigger a workflow
   * @param eventName
   * @param requestBody
   * @returns
   */
  async trigger(eventName: string, triggerPayloadOpts: ITriggerPayloadOptions) {
    return fetch(`${this.API_BASE_URL}/events/trigger`, {
      method: 'POST',
      headers: {
        Authorization: `ApiKey ${this.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: eventName,
        ...triggerPayloadOpts,
      }),
    });
  }

  subscribers = {
    /**
     * Creates a new subscriber. This has an upsert behavior, only updating attributes that are present in the request.
     * (REST API doc: https://docs.novu.co/api-reference/subscribers/create-subscriber)
     * @param subscriberId
     * @param subscriberPayloadOpts
     * @returns
     */
    create: async (subscriberId: string, subscriberPayloadOpts: ISubscriberPayload) => {
      return fetch(`${this.API_BASE_URL}/subscribers`, {
        method: 'POST',
        headers: {
          Authorization: `ApiKey ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriberId,
          ...subscriberPayloadOpts,
        }),
      });
    },
  };
}
