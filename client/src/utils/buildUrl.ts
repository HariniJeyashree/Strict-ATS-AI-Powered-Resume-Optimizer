export function buildUrl(path: string, params: Record<string, any>) {

  let url = path;

  Object.keys(params).forEach((key) => {
    url = url.replace(`:${key}`, params[key]);
  });

  return url;
}