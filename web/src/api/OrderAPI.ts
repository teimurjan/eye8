import { Client } from 'ttypes/http';

import { IHeadersManager } from 'src/manager/HeadersManager';

// LIST
export interface IOrderListResponseItem {
  id: number;
  user_name: string;
  user_phone_number: string;
  user_address: string;
  created_on: string;
  items: Array<{
    id: number;
    quantity: number;
    product_price_per_item: number;
    product_discount: number;
    product_upc?: string;
    product?: {
      id: number;
      quantity: number;
      product_type: {
        id: number;
        name: string;
      };
    };
  }>;
  status: 'idle' | 'completed' | 'approved' | 'rejected';
}

export interface IOrderListResponseData {
  data: IOrderListResponseItem[];
}

// DETAIL
export interface IOrderResponseData {
  data: IOrderListResponseItem;
}

// PAYLOADS
export interface IOrderCreatePayload {
  user_name: string;
  user_phone_number: string;
  user_address: string;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

export interface IOrderEditPayload {
  user_name: string;
  user_phone_number: string;
  user_address: string;
  items: Array<
    | {
        product_id: number;
        quantity: number;
      }
    | number
  >;
  status: string;
}

export interface IOrderAPI {
  getAll(): Promise<IOrderListResponseData>;
  create(payload: IOrderCreatePayload): Promise<IOrderResponseData>;
  edit(orderID: number, payload: IOrderEditPayload): Promise<IOrderResponseData>;
  getOne(orderID: number): Promise<IOrderResponseData>;
  status(id: number): Promise<{}>;
  delete(id: number): Promise<{}>;
}

export const errors = {
  OrderNotFound: class extends Error {
    constructor() {
      super('Order type not found');
      Object.setPrototypeOf(this, new.target.prototype);
    }
  },
};

export class OrderAPI implements IOrderAPI {
  private client: Client;
  private headersManager: IHeadersManager;

  constructor(client: Client, headersManager: IHeadersManager) {
    this.client = client;
    this.headersManager = headersManager;
  }

  public async getAll() {
    try {
      const response = await this.client.get<IOrderListResponseData>(`/api/orders`, {
        headers: this.headersManager.getHeaders(),
      });
      return response.data;
    } catch (e) {
      throw e;
    }
  }

  public async create(data: IOrderCreatePayload) {
    try {
      const response = await this.client.post<IOrderResponseData>(`/api/orders`, data, {
        headers: this.headersManager.getHeaders(),
      });
      return response.data;
    } catch (e) {
      throw e;
    }
  }

  public async edit(orderID: number, data: IOrderEditPayload) {
    try {
      const response = await this.client.put<IOrderResponseData>(`/api/orders/${orderID}`, data, {
        headers: this.headersManager.getHeaders(),
      });
      return response.data;
    } catch (e) {
      if (e.response.status === 404) {
        throw new errors.OrderNotFound();
      }
      throw e;
    }
  }

  public async getOne(orderID: number) {
    try {
      const response = await this.client.get<IOrderResponseData>(`/api/orders/${orderID}`, {
        headers: this.headersManager.getHeaders(),
      });
      return response.data;
    } catch (e) {
      if (e.response.status === 404) {
        throw new errors.OrderNotFound();
      }
      throw e;
    }
  }

  public async status(orderID: number) {
    try {
      await this.client.head(`/api/orders/${orderID}`, {
        headers: this.headersManager.getHeaders(),
      });
      return {};
    } catch (e) {
      if (e.response.status === 404) {
        throw new errors.OrderNotFound();
      }
      throw e;
    }
  }

  public async delete(orderID: number) {
    try {
      await this.client.delete(`/api/orders/${orderID}`, {
        headers: this.headersManager.getHeaders(),
      });
      return {};
    } catch (e) {
      if (e.response.status === 404) {
        throw new errors.OrderNotFound();
      }
      throw e;
    }
  }
}