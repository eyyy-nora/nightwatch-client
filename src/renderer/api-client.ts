import axios, { type AxiosInstance, type AxiosRequestConfig, AxiosResponse } from "axios";
import { useEffect, useState } from "react";

export interface ApiHookOptions {
  client?: AxiosInstance;
  config?: AxiosRequestConfig;
}

function useApi<Response = unknown>({ client: initClient, config: init = {} }: ApiHookOptions) {
  const [config, setConfig] = useState({ ...init });
  const [client] = useState<AxiosInstance>(() => initClient ?? axios.create(config));
  const [response, setResponse] = useState<AxiosResponse<Response> | undefined>();
  const [data, setData] = useState<Response | undefined>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const source = axios.CancelToken.source();
    setBusy(true);
    client?.request({ ...config, cancelToken: source.token }).then(response => {
      setResponse(response);
      setBusy(false);
    });
    return () => {
      source.cancel();
      setBusy(false);
    };
  }, [config]);

  useEffect(() => {
    setData(response?.data);
  });

  return { response, data, config, setConfig, busy };
}
