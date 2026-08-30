export const ETIS_CALLBACK_OPEN_EVENT = "etis:callback-open";

export type CallbackOpenDetail = {
  source?: string;
};

/**
 * Открывает единую форму обратного звонка из любой client-компоненты.
 * CustomEvent позволяет не протягивать provider через всю шапку и sticky-header.
 */
export function openEtisCallback(source = "site") {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<CallbackOpenDetail>(ETIS_CALLBACK_OPEN_EVENT, {
      detail: { source },
    }),
  );
}
