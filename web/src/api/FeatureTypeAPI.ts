import { Client } from "ttypes/http";

import { IHeadersManager } from "src/manager/HeadersManager";
import { buildQueryString } from "src/utils/queryString";

export interface IFeatureTypeListResponseItem {
  id: number;
  name: string;
}

export interface IFeatureTypeListRawIntlResponseItem {
  id: number;
  name: {
    [key: string]: string;
  };
}

export interface IFeatureTypeListResponseData {
  data: IFeatureTypeListResponseItem[];
}

export interface IFeatureTypeListRawIntlResponseData {
  data: IFeatureTypeListRawIntlResponseItem[];
}

export interface IFeatureTypeRawIntlResponseData {
  data: IFeatureTypeListRawIntlResponseItem;
}

export interface IFeatureTypeCreatePayload {
  names: {
    [key: string]: string;
  };
}

export interface IFeatureTypeEditPayload {
  names: {
    [key: string]: string;
  };
}

export interface IFeatureTypeAPI {
  getAll(): Promise<IFeatureTypeListResponseData>;
  getAllRawIntl(): Promise<IFeatureTypeListRawIntlResponseData>;
  delete(id: number): Promise<{}>;
  create(
    payload: IFeatureTypeCreatePayload
  ): Promise<IFeatureTypeRawIntlResponseData>;
  edit(
    id: number,
    payload: IFeatureTypeEditPayload
  ): Promise<IFeatureTypeRawIntlResponseData>;
}

export class FeatureTypeAPI implements IFeatureTypeAPI {
  private client: Client;
  private headersManager: IHeadersManager;

  constructor(client: Client, headersManager: IHeadersManager) {
    this.client = client;
    this.headersManager = headersManager;
  }

  public async getAll() {
    try {
      const response = await this.client.get<IFeatureTypeListResponseData>(
        "/api/feature_types",
        {
          headers: this.headersManager.getHeaders()
        }
      );
      return response.data;
    } catch (e) {
      throw e;
    }
  }

  public async getAllRawIntl() {
    try {
      const response = await this.client.get<
        IFeatureTypeListRawIntlResponseData
      >(`/api/feature_types${buildQueryString({ raw_intl: 1 })}`, {
        headers: this.headersManager.getHeaders()
      });

      return response.data;
    } catch (e) {
      throw e;
    }
  }

  public async delete(id: number) {
    try {
      const response = await this.client.delete<{}>(
        `/api/feature_types/${id}`,
        {
          headers: this.headersManager.getHeaders()
        }
      );
      return response.data;
    } catch (e) {
      throw e;
    }
  }

  public async create(payload: IFeatureTypeCreatePayload) {
    try {
      const response = await this.client.post<IFeatureTypeRawIntlResponseData>(
        `/api/feature_types`,
        payload,
        {
          headers: this.headersManager.getHeaders()
        }
      );
      return response.data;
    } catch (e) {
      throw e;
    }
  }

  public async edit(id: number, payload: IFeatureTypeEditPayload) {
    try {
      const response = await this.client.put<IFeatureTypeRawIntlResponseData>(
        `/api/feature_types/${id}`,
        payload,
        {
          headers: this.headersManager.getHeaders()
        }
      );
      return response.data;
    } catch (e) {
      throw e;
    }
  }
}