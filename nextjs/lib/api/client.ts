import { API_V1 } from "./config";

/**
 * Ошибка API — с кодом и телом ответа для диагностики.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly url: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type FetchOptions = {
  /** ISR: сколько секунд кэшировать (Next.js). undefined = дефолт fetch */
  revalidate?: number;
  /** Теги для revalidateTag() */
  tags?: readonly string[];
  /** Дополнительные заголовки */
  headers?: Record<string, string>;
  /** Query-параметры */
  query?: Record<string, string | number | boolean | null | undefined>;
  /** Отключить кэш (для мутаций / приватных данных) */
  noStore?: boolean;
  /** HTTP-метод (по умолчанию GET) */
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Тело запроса (сериализуется в JSON) */
  body?: unknown;
  /** Bearer-токен (для защищённых эндпоинтов на Sanctum) */
  token?: string;
};

/**
 * Сборка query-строки: пропускаем null/undefined, оставляем остальное.
 */
function buildQuery(query?: FetchOptions["query"]): string {
  if (!query) return "";
  const entries = Object.entries(query).filter(
    ([, v]) => v !== null && v !== undefined && v !== "",
  );
  if (entries.length === 0) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of entries) sp.append(k, String(v));
  return `?${sp.toString()}`;
}

/**
 * Универсальный fetch к Laravel API v1.
 *
 * @param path — относительный путь без ведущего слеша (например, "home", "products/kotel-baxi")
 * @returns распарсенный JSON типа T
 * @throws ApiError при не-2xx ответе
 */
export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const {
    revalidate,
    tags,
    headers,
    query,
    noStore,
    method = "GET",
    body,
    token,
  } = options;

  const url = `${API_V1}/${path.replace(/^\/+/, "")}${buildQuery(query)}`;

  const init: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {
    method,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  if (noStore) {
    init.cache = "no-store";
  } else if (revalidate !== undefined || tags) {
    init.next = {
      ...(revalidate !== undefined ? { revalidate } : {}),
      ...(tags ? { tags: [...tags] } : {}),
    };
  }

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (err) {
    // Сетевая ошибка (Laravel не запущен, DNS, timeout)
    throw new ApiError(
      `Network error while fetching ${url}: ${(err as Error).message}`,
      0,
      url,
    );
  }

  if (!response.ok) {
    let errorBody: unknown = null;
    try {
      errorBody = await response.json();
    } catch {
      try {
        errorBody = await response.text();
      } catch {
        /* ignore */
      }
    }
    throw new ApiError(
      `API ${method} ${url} failed with ${response.status}`,
      response.status,
      url,
      errorBody,
    );
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
