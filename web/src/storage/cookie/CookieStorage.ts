import { Storage } from 'ttypes/storage';
import Cookies, { CookieSetOptions } from 'universal-cookie';

const cookies = new Cookies();

export interface ICookieStorage extends Storage {
  length: number;
  clear(): void;
  getItem(key: string): string | null;
  key(index: number): string | null;
  removeItem(key: string, options?: CookieSetOptions): void;
  setItem(key: string, value: string, options?: CookieSetOptions): void;
  [key: string]: any;
}

export class CookieStorage implements ICookieStorage {
  get length() {
    return Object.keys(cookies.getAll()).length;
  }

  key = (i: number) => Object.keys(cookies.getAll())[i];

  removeItem = (key: string, options: CookieSetOptions = { path: '/' }) => {
    cookies.remove(key, options);
  };

  clear = () => {
    Object.keys(cookies.getAll()).forEach(key => this.removeItem(key));
  };

  getItem = (key: string) => {
    const item = cookies.get(key);
    return item ? item : null;
  };

  setItem = (key: string, value: string, options: CookieSetOptions = { path: '/' }) => {
    cookies.set(key, value, options);
  };
}