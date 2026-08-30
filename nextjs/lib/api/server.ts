/**
 * Обёртка над fetch для Server Components.
 *
 * Плюс: работает в Next.js кэше, поддерживает revalidate (ISR).
 * Минус: не имеет interceptors — авторизацию для приватных запросов
 *        добавляем вручную через параметр `token`.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export type FetchOptions = {
  /**
   * Через сколько секунд Next.js перепроверит данные.
   * 0 = никогда не кэшировать (полностью динамика).
   * По умолчанию: 300 (5 минут).
   */
  revalidate?: number | false;

  /**
   * Bearer токен для приватных эндпоинтов.
   */
  token?: string;

  /**
   * Дополнительные query-параметры.
   */
  params?: Record<string, string | number | boolean | undefined | null>;

  /**
   * Дополнительные заголовки.
   */
  headers?: Record<string, string>;

  /**
   * Cache tag для on-demand revalidation (revalidateTag).
   */
  tags?: string[];
};

function buildUrl(path: string, params?: FetchOptions["params"]): string {
  const url = new URL(API_URL.replace(/\/$/, "") + "/" + path.replace(/^\//, ""));

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      url.searchParams.set(k, String(v));
    });
  }

  return url.toString();
}

export async function apiGet<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { revalidate = 300, token, params, headers, tags } = options;

  const url = buildUrl(path, params);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    next: {
      revalidate: revalidate === false ? false : revalidate,
      ...(tags ? { tags } : {}),
    },
  });

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* noop */
    }
    throw new ApiError(res.status, `API ${res.status} on GET ${path}`, body);
  }

  return (await res.json()) as T;
}

export async function apiPost<T>(
  path: string,
  data: unknown,
  options: Omit<FetchOptions, "revalidate"> = {}
): Promise<T> {
  const { token, params, headers } = options;

  const url = buildUrl(path, params);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: JSON.stringify(data),
    cache: "no-store",
  });

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* noop */
    }
    throw new ApiError(res.status, `API ${res.status} on POST ${path}`, body);
  }

  return (await res.json()) as T;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body: unknown = null
  ) {
    super(message);
    this.name = "ApiError";
  }
}
