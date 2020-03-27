import { normalize, schema } from 'normalizr';

import * as productTypeAPI from 'src/api/ProductTypeAPI';

export const errors = {
  ProductTypeNotExists: class extends Error {
    constructor() {
      super();
      Object.setPrototypeOf(this, new.target.prototype);
    }
  },
  ProductTypeHasProducts: class extends Error {
    constructor() {
      super();
      Object.setPrototypeOf(this, new.target.prototype);
    }
  },
};

export interface IProductTypeService {
  getForCategory(
    categoryId: number,
    page: number,
  ): Promise<{
    entities: {
      productTypes: {
        [key: string]: productTypeAPI.IProductTypeListResponseItem;
      };
    };
    result: number[];
    meta: productTypeAPI.IProductTypeListResponseMeta;
  }>;
  getAll(
    page: number,
  ): Promise<{
    entities: {
      productTypes: {
        [key: string]: productTypeAPI.IProductTypeListResponseItem;
      };
    };
    result: number[];
  }>;
  getNewest(): Promise<{
    entities: {
      productTypes: {
        [key: string]: productTypeAPI.IProductTypeListResponseItem;
      };
    };
    result: number[];
  }>;
  getByID(id: number): Promise<productTypeAPI.IProductTypeDetailResponseItem | undefined>;
  getAllRawIntl(
    page: number,
  ): Promise<{
    entities: {
      productTypes: {
        [key: string]: productTypeAPI.IProductTypeListRawIntlResponseItem;
      };
    };
    result: number[];
    meta: productTypeAPI.IProductTypeListResponseMeta;
  }>;
  getAllRawIntlMinified(): Promise<{
    entities: {
      productTypes: {
        [key: string]: productTypeAPI.IProductTypeListRawIntlMinifiedResponseItem;
      };
    };
    result: number[];
  }>;
  delete(id: number): Promise<void>;
  create(
    payload: productTypeAPI.IProductTypeCreatePayload,
  ): Promise<productTypeAPI.IProductTypeListRawIntlResponseItem>;
  edit(
    id: number,
    payload: productTypeAPI.IProductTypeEditPayload,
  ): Promise<productTypeAPI.IProductTypeListRawIntlResponseItem>;
  exists(id: number): Promise<boolean>;
  getOneRawIntl(id: number): Promise<productTypeAPI.IProductTypeListRawIntlResponseItem | undefined>;
}

export class ProductTypeService implements IProductTypeService {
  private API: productTypeAPI.IProductTypeAPI;
  constructor(API: productTypeAPI.IProductTypeAPI) {
    this.API = API;
  }

  public getForCategory: IProductTypeService['getForCategory'] = async (categoryId: number, page: number) => {
    const productTypes = await this.API.getForCategory(categoryId, page);
    return {
      ...normalize(productTypes.data, [new schema.Entity('productTypes')]),
      meta: productTypes.meta,
    };
  };

  public getAll: IProductTypeService['getAll'] = async (page: number) => {
    const productTypes = await this.API.getAll(page);
    return {
      ...normalize(productTypes.data, [new schema.Entity('productTypes')]),
      meta: productTypes.meta,
    };
  };

  public getAllRawIntlMinified: IProductTypeService['getAllRawIntlMinified'] = async () => {
    const productTypes = await this.API.getAllRawIntlMinified();
    return normalize(productTypes.data, [new schema.Entity('productTypes')]);
  };

  public getNewest: IProductTypeService['getNewest'] = async () => {
    const productTypes = await this.API.getNewest();
    return normalize(productTypes.data, [new schema.Entity('productTypes')]);
  };

  public getByID: IProductTypeService['getByID'] = async (id: number) => {
    try {
      return (await this.API.getByID(id)).data;
    } catch (e) {
      if (e instanceof productTypeAPI.errors.ProductTypeNotFound) {
        return undefined;
      }

      throw e;
    }
  };

  public getAllRawIntl: IProductTypeService['getAllRawIntl'] = async (page: number) => {
    const productTypes = await this.API.getAllRawIntl(page);
    return {
      ...normalize(productTypes.data, [new schema.Entity('productTypes')]),
      meta: productTypes.meta,
    };
  };

  public delete: IProductTypeService['delete'] = async (id: number) => {
    try {
      await this.API.delete(id);
    } catch (e) {
      if (e instanceof productTypeAPI.errors.ProductTypeNotFound) {
        throw new errors.ProductTypeNotExists();
      }
      if (e instanceof productTypeAPI.errors.ProductTypeWithProductsIsUntouchable) {
        throw new errors.ProductTypeHasProducts();
      }

      throw e;
    }
  };

  public create: IProductTypeService['create'] = async (payload: productTypeAPI.IProductTypeCreatePayload) => {
    return (await this.API.create(payload)).data;
  };

  public edit: IProductTypeService['edit'] = async (id: number, payload: productTypeAPI.IProductTypeEditPayload) => {
    try {
      return (await this.API.edit(id, payload)).data;
    } catch (e) {
      if (e instanceof productTypeAPI.errors.ProductTypeNotFound) {
        throw new errors.ProductTypeNotExists();
      }

      throw e;
    }
  };

  public exists: IProductTypeService['exists'] = async (id: number) => {
    try {
      await this.API.status(id);
      return true;
    } catch (e) {
      if (e instanceof productTypeAPI.errors.ProductTypeNotFound) {
        return false;
      }

      throw e;
    }
  };

  public getOneRawIntl: IProductTypeService['getOneRawIntl'] = async (id: number) => {
    try {
      return (await this.API.getOneRawIntl(id)).data;
    } catch (e) {
      if (e instanceof productTypeAPI.errors.ProductTypeNotFound) {
        return undefined;
      }

      throw e;
    }
  };
}
