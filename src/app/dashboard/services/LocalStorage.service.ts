import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  get<T>(key: string): T | null {
    const data = localStorage.getItem(key);

    if (!data) {
      const defaultValue = [6, 6, 6, 6, 6, 0, 6, 6, 6, 6, 6, 6] as unknown as T;
      this.set<T>(key, defaultValue);
      return defaultValue;
    }

    return JSON.parse(data);
  }


  set<T>(key: string, value: T) {
    if (typeof value === 'string' && value.includes(',')) {
      const arr = value
        .split(',')
        .map(x => Number(x.trim()))
        .filter(x => !isNaN(x));
      localStorage.setItem(key, JSON.stringify(arr));
      return;
    }

    if (Array.isArray(value)) {
      const arr = value.map(x => typeof x === 'string' ? Number(x) : x);
      localStorage.setItem(key, JSON.stringify(arr));
      return;
    }

    localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }
}
