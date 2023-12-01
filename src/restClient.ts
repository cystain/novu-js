import type { ITriggerPayloadOptions, ISubscriberPayload } from '@novu/node';
import { IChannelCredentials } from '@novu/shared';

/**
 * The Novu Rest API Client
 */
export class NovuRestClient {
  private API_KEY: string | null = null;
  private API_BASE_URL: string = 'https://api.novu.co/v1';

  /**
   * Contructor for the Novu Rest API Client
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
     * Retrieves a subscriber's details.
     * (REST API doc: https://docs.novu.co/api-reference/subscribers/get-subscribers)
     * @param subscriberId
     * @param subscriberPayloadOpts
     * @returns
     */
    get: async (subscriberId: string) => {
      return fetch(`${this.API_BASE_URL}/subscribers/${subscriberId}`, {
        method: 'GET',
        headers: {
          Authorization: `ApiKey ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
    },
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
    /**
     * Deletes a subscriber.
     * (REST API doc: https://docs.novu.co/api-reference/subscribers/delete-subscriber)
     * @param subscriberId
     * @returns
     */
    delete: async (subscriberId: string) => {
      return fetch(`${this.API_BASE_URL}/subscribers/${subscriberId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `ApiKey ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
    },
    /**
     * Updates an existing subscriber.
     * (REST API doc: https://docs.novu.co/api-reference/subscribers/update-subscriber)
     * @param subscriberId
     * @param subscriberPayloadOpts
     * @returns
     */
    update: async (subscriberId: string, subscriberPayloadOpts: ISubscriberPayload) => {
      return fetch(`${this.API_BASE_URL}/subscribers/${subscriberId}`, {
        method: 'PUT',
        headers: {
          Authorization: `ApiKey ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriberPayloadOpts),
      });
    },
    /**
     * Updates the credentials of a subscriber
     * (REST API doc: https://docs.novu.co/api-reference/subscribers/update-subscriber-credentials)
     * @param subscriberId
     * @param providerId
     * @param credentials
     * @returns
     */
    setCredentials: async (
      subscriberId: string,
      providerId: ChatPushProviderId,
      credentials: IChannelCredentials
    ) => {
      return fetch(`${this.API_BASE_URL}/subscribers/${subscriberId}/credentials`, {
        method: 'PUT',
        headers: {
          Authorization: `ApiKey ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credentials,
          providerId,
        }),
      });
    },

    /**
     * Delete deviceToken(s) from a subscriber's credential.
     * (REST API doc: https://docs.novu.co/api-reference/subscribers/update-subscriber-credentials)
     * @param subscriberId
     * @param providerId
     * @param deviceTokens the deviceToken(s) to delete
     * @returns Promise that resolves with the fetch response. true if no errors and no change were done
     */
    deleteDeviceTokens: async (
      subscriberId: string,
      providerId: ChatPushProviderId,
      deviceTokensToDelete: Array<string>
    ) => {
      // Retrieve the current array of tokens of the subscriber
      const getResp = await this.subscribers.get(subscriberId);
      if (!getResp.ok) {
        return getResp;
      }
      const subData = (await getResp.json()).data;
      // Check if the subscriber had the deviceTokens
      const channel = subData.channels?.find((c: any) => c.providerId === providerId);
      const currDeviceTokens = channel?.credentials?.deviceTokens;
      if (currDeviceTokens?.length > 0) {
        // Remove the deviceTokens from the current array
        const updatedDeviceTokens = currDeviceTokens.filter(
          (dt: string) => !deviceTokensToDelete.includes(dt)
        );

        // Check if there is a change in the array
        if (updatedDeviceTokens.length !== currDeviceTokens.length) {
          // Clear the deviceTokens first, then set the updated array (Ref to approach: https://discord.com/channels/895029566685462578/1151537644463980655/1152302182369075341)
          return this.subscribers
            .setCredentials(subscriberId, providerId, {
              deviceTokens: [],
            })
            .then(() =>
              this.subscribers.setCredentials(subscriberId, providerId, {
                deviceTokens: updatedDeviceTokens,
              })
            );
        }
      }
      return true;
    },

    /**
     * Replace existing deviceTokens of subscribers with new token(s)
     * (REST API doc: https://docs.novu.co/api-reference/subscribers/update-subscriber-credentials)
     * @param subscriberIds
     * @param providerId
     * @param oldDeviceTokens the old deviceToken(s) to delete
     * @param newDeviceTokens the new deviceToken(s) to add
     * @returns Promise that resolves with the fetch response. true if no errors and no change were done
     */
    replaceDeviceTokens: async (
      subscriberIds: Array<string>,
      providerId: ChatPushProviderId,
      oldDeviceTokens: Array<string>,
      newDeviceTokens: Array<string>
    ) => {
      const promises: Array<Promise<any>> = [];
      for (const subscriberId of subscriberIds) {
        promises.push(
          // delete the old token(s)
          this.subscribers.deleteDeviceTokens(subscriberId, providerId, oldDeviceTokens).then(() =>
            // add the new token(s)
            this.subscribers.setCredentials(subscriberId, providerId, {
              deviceTokens: newDeviceTokens,
            })
          )
        );
      }
      await Promise.all(promises);
      return true;
    },
  };
}

// Based from `ChatProviderIdEnum` and `PushProviderIdEnum`
type ChatPushProviderId =
  | 'fcm'
  | 'apns'
  | 'expo'
  | 'one-signal'
  | 'push-webhook'
  | 'slack'
  | 'discord'
  | 'msteams'
  | 'mattermost';
