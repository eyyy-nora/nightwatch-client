import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { sleep } from "src/util/sleep";

export function createApiResultGenerator<Response, T = Response>({
  next = findNextLink,
  resolve = res => res.data as unknown as T,
  instance = axios.create(),
  ms = 1000,
}: {
  next?: (res: AxiosResponse, config: string | AxiosRequestConfig) => string | AxiosRequestConfig;
  resolve?: (res: AxiosResponse<Response>) => T;
  instance?: AxiosInstance;
  ms?: number;
}) {
  return async function* (config: AxiosRequestConfig | string): AsyncGenerator<T> {
    do {
      const options = typeof config === "string" ? { url: config, method: "get" } : config;
      const response = await instance.request<Response>(options);
      yield resolve(response);
      const result = next(response, config);
      if (typeof result === "string" && typeof config !== "string") config = { ...config, url: result };
      else if (typeof result === "object" && typeof config === "object") config = { ...config, ...result };
      else config = result;
      await sleep(ms);
    } while (config);
  };
}

export function findNextLink(res: AxiosResponse) {
  return res.data.links.find((it: any) => it.rel === "next")?.href;
}
