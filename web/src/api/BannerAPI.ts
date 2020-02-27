import { Client } from 'ttypes/http';

import { IHeadersManager } from 'src/manager/HeadersManager';
import { buildQueryString } from 'src/utils/queryString';

export interface IBannerListResponseItem {
  id: number;
  text: string;
  link_text: string;
  link: string | null;
  image: string;
  text_top_offset: number | null;
  text_left_offset: number | null;
  text_right_offset: number | null;
  text_bottom_offset: number | null;
}

export interface IBannerListRawIntlResponseItem {
  id: number;
  text: {
    [key: string]: string;
  };
  link_text: {
    [key: string]: string;
  };
  link: string | null;
  image: string;
  text_top_offset: number | null;
  text_left_offset: number | null;
  text_right_offset: number | null;
  text_bottom_offset: number | null;
}

export interface IBannerListResponseData {
  data: IBannerListResponseItem[];
}

export interface IBannerListRawIntlResponseData {
  data: IBannerListRawIntlResponseItem[];
}

export interface IBannerRawIntlResponseData {
  data: IBannerListRawIntlResponseItem;
}

export interface IBannerCreatePayload {
  texts: {
    [key: string]: string;
  };
  link_texts: {
    [key: string]: string;
  };
  link: string | null;
  image: string;
  text_top_offset: number | null;
  text_left_offset: number | null;
  text_right_offset: number | null;
  text_bottom_offset: number | null;
}

export interface IBannerAPI {
  getAll(): Promise<IBannerListResponseData>;
  getAllRawIntl(): Promise<IBannerListRawIntlResponseData>;
  delete(id: number): Promise<{}>;
  create(payload: IBannerCreatePayload): Promise<IBannerRawIntlResponseData>;
  edit(id: number, payload: IBannerCreatePayload): Promise<IBannerRawIntlResponseData>;
  status(id: number): Promise<{}>;
  getOneRawIntl(id: number): Promise<IBannerRawIntlResponseData>;
}

export const errors = {
  BannerNotFound: class extends Error {
    constructor() {
      super('Banner not found');
      Object.setPrototypeOf(this, new.target.prototype);
    }
  },
};

export class BannerAPI implements IBannerAPI {
  private client: Client;
  private headersManager: IHeadersManager;

  constructor(client: Client, headersManager: IHeadersManager) {
    this.client = client;
    this.headersManager = headersManager;
  }

  public async getAll() {
    try {
      const response = await this.client.get<IBannerListResponseData>('/api/banners', {
        headers: this.headersManager.getHeaders(),
      });
      return response.data;
    } catch (e) {
      throw e;
    }
  }

  public async getAllRawIntl() {
    try {
      const response = await this.client.get<IBannerListRawIntlResponseData>(
        `/api/banners${buildQueryString({ raw_intl: 1 })}`,
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
      const response = await this.client.delete<{}>(`/api/banners/${id}`, {
        headers: this.headersManager.getHeaders(),
      });
      return response.data;
    } catch (e) {
      if (e.response.status === 404) {
        throw new errors.BannerNotFound();
      }

      throw e;
    }
  }

  public async status(id: number) {
    try {
      const response = await this.client.head<{}>(`/api/banners/${id}`, {
        headers: this.headersManager.getHeaders(),
      });
      return response.data;
    } catch (e) {
      if (e.response.status === 404) {
        throw new errors.BannerNotFound();
      }
      throw e;
    }
  }

  public async create({ image, ...json }: IBannerCreatePayload) {
    try {
      const formData = new FormData();
      formData.append('json', JSON.stringify(json));
      formData.append('image', image);
      const response = await this.client.post<IBannerRawIntlResponseData>(`/api/banners`, formData, {
        headers: this.headersManager.getHeaders(),
      });
      return response.data;
    } catch (e) {
      throw e;
    }
  }

  public async edit(id: number, { image, ...json }: IBannerCreatePayload) {
    try {
      const formData = new FormData();
      formData.append('json', JSON.stringify(json));
      formData.append('image', image);
      const response = await this.client.put<IBannerRawIntlResponseData>(
        `/api/banners/${id}${buildQueryString({ raw_intl: 1 })}`,
        formData,
        {
          headers: this.headersManager.getHeaders(),
        },
      );
      return response.data;
    } catch (e) {
      if (e.response.status === 404) {
        throw new errors.BannerNotFound();
      }
      throw e;
    }
  }

  public async getOneRawIntl(id: number) {
    try {
      const response = await this.client.get<IBannerRawIntlResponseData>(
        `/api/banners/${id}${buildQueryString({ raw_intl: 1 })}`,
        {
          headers: this.headersManager.getHeaders(),
        },
      );
      return response.data;
    } catch (e) {
      if (e.response.status === 404) {
        throw new errors.BannerNotFound();
      }
      throw e;
    }
  }
}