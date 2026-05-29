import axios, { type AxiosRequestConfig } from 'axios'

const axiosInstance = axios.create({ baseURL: '' })

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source()
  const promise = axiosInstance({ ...config, cancelToken: source.token }).then(({ data }) => data)
  // @ts-expect-error cancel is a custom extension orval expects
  promise.cancel = () => source.cancel('Query was cancelled')
  return promise
}

export default axiosInstance
