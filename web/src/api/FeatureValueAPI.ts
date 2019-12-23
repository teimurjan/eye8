import { Client } from 'ttypes/http';

import { IHeadersManager } from 'src/manager/HeadersManager';
import { buildQueryString } from 'src/utils/queryString';

import { IFeatureTypeListRawIntlResponseItem, IFeatureTypeListResponseItem } from './FeatureTypeAPI';

export interface IFeatureValueListResponseItem {
  id: number;
  name: string;
  feature_type: IFeatureTypeListResponseItem;
}

export interface IFeatureValueListRawIntlResponseItem {
  id: number;
  name: {
    [key: string]: string;
  };
  feature_type: IFeatureTypeListRawIntlResponseItem;
}

export interface IFeatureValueListResponseData {
  data: IFeatureValueListResponseItem[];
}

export interface IFeatureValueListRawIntlResponseData {
  data: IFeatureValueListRawIntlResponseItem[];
}

export interface IFeatureValueRawIntlResponseData {
  data: IFeatureValueListRawIntlResponseItem;
}

export interface IFeatureValueCreatePayload {
  names: {
    [key: string]: string;
  };
  feature_type_id: number;
}

export interface IFeatureValueEditPayload {
  names: {
    [key: string]: string;
  };
  feature_type_id: number;
}

export interface IFeatureValueAPI {
  getAll(): Promise<IFeatureValueListResponseData>;
  getAllRawIntl(): Promise<IFeatureValueListRawIntlResponseData>;
  delete(id: number): Promise<{}>;
  create(payload: IFeatureValueCreatePayload): Promise<IFeatureValueRawIntlResponseData>;
  edit(id: number, payload: IFeatureValueEditPayload): Promise<IFeatureValueRawIntlResponseData>;
  status(id: number): Promise<{}>;
  getOneRawIntl(id: number): Promise<IFeatureValueRawIntlResponseData>;
}

export const errors = {
  FeatureValueNotFound: class extends Error {
    constructor() {
      super('Feature value not found');
      Object.setPrototypeOf(this, new.target.prototype);
    }
  },
};

export class FeatureValueAPI implements IFeatureValueAPI {
  private client: Client;
  private headersManager: IHeadersManager;

  constructor(client: Client, headersManager: IHeadersManager) {
    this.client = client;
    this.headersManager = headersManager;
  }

  public async getAll() {
    try {
      const response = await this.client.get<IFeatureValueListResponseData>('/api/feature_values', {
        headers: this.headersManager.getHeaders(),
      });
      return response.data;
    } catch (e) {
      throw e;
    }
  }

  public async getAllRawIntl() {
    try {
      const response = await this.client.get<IFeatureValueListRawIntlResponseData>(
        `/api/feature_values${buildQueryString({ raw_intl: 1 })}`,
        {
          headers: this.headersManager.getHeaders(),
        },
      );

      return response.data;
    } catch (e) {
      throw e;
    }
  }

  public async delete(id: number) {
    try {
      const response = await this.client.delete<{}>(`/api/feature_values/${id}`, {
        headers: this.headersManager.getHeaders(),
      });
      return response.data;
    } catch (e) {
      if (e.response.status === 404) {
        throw new errors.FeatureValueNotFound();
      }
      throw e;
    }
  }

  public async create(payload: IFeatureValueCreatePayload) {
    try {
      const response = await this.client.post<IFeatureValueRawIntlResponseData>(`/api/feature_values`, payload, {
        headers: this.headersManager.getHeaders(),
      });
      return response.data;
    } catch (e) {
      throw e;
    }
  }

  public async edit(id: number, payload: IFeatureValueEditPayload) {
    try {
      const response = await this.client.put<IFeatureValueRawIntlResponseData>(
        `/api/feature_values/${id}${buildQueryString({ raw_intl: 1 })}`,
        payload,
        {
          headers: this.headersManager.getHeaders(),
        },
      );
      return response.data;
    } catch (e) {
      if (e.response.status === 404) {
        throw new errors.FeatureValueNotFound();
      }
      throw e;
    }
  }

  public async status(id: number) {
    try {
      const response = await this.client.head<{}>(`/api/feature_values/${id}`, {
        headers: this.headersManager.getHeaders(),
      });
      return response.data;
    } catch (e) {
      if (e.response.status === 404) {
        throw new errors.FeatureValueNotFound();
      }
      throw e;
    }
  }

  public async getOneRawIntl(id: number) {
    try {
      const response = await this.client.get<IFeatureValueRawIntlResponseData>(
        `/api/feature_values/${id}${buildQueryString({ raw_intl: 1 })}`,
        {
          headers: this.headersManager.getHeaders(),
        },
      );
      return response.data;
    } catch (e) {
      if (e.response.status === 404) {
        throw new errors.FeatureValueNotFound();
      }
      throw e;
    }
  }
}