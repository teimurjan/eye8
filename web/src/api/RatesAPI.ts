import { Client } from 'ttypes/http';

import { IHeadersManager } from 'src/manager/HeadersManager';
import { buildQueryString } from 'src/utils/queryString';

export interface RatesListResponseData {
  data: {
    KGS_USD: number;
  };
}

export interface IRatesAPI {
  getAll(date?: string): Promise<RatesListResponseData>;
}

export class RatesAPI implements IRatesAPI {
  private client: Client;
  private headersManager: IHeadersManager;

  constructor(client: Client, headersManager: IHeadersManager) {
    this.client = client;
    this.headersManager = headersManager;
  }

  public async getAll(date?: string) {
    try {
      const response = await this.client.get<RatesListResponseData>(
        `/api/currency_rates${buildQueryString({ date })}`,
        {
          headers: this.headersManager.getHeaders(),
        },
      );
      return response.data;
    } catch (e) {
      throw e;
    }
  }
}
