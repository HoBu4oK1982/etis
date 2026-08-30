/**
 * Единая маска казахстанского номера +7 (___) ___-__-__.
 * Код страны сохраняется, но все цифры после +7 можно нормально удалить.
 */

function normalizePhoneDigits(input: string): string {
  let digits = input.replace(/\D/g, "");

  if (digits.startsWith("8")) digits = `7${digits.slice(1)}`;
  if (!digits.startsWith("7")) digits = `7${digits}`;

  return digits.slice(0, 11);
}

export function formatPhone(input: string): string {
  const digits = normalizePhoneDigits(input);
  const body = digits.slice(1);

  let result = "+7";
  if (body.length > 0) result += ` (${body.slice(0, 3)}`;
  if (body.length >= 3) result += ")";
  if (body.length > 3) result += ` ${body.slice(3, 6)}`;
  if (body.length > 6) result += `-${body.slice(6, 8)}`;
  if (body.length > 8) result += `-${body.slice(8, 10)}`;
  return result;
}

function caretPositionForDigitCount(value: string, digitCount: number): number {
  if (digitCount <= 0) return 0;

  let seen = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (/\d/.test(value[index])) seen += 1;
    if (seen >= digitCount) return index + 1;
  }
  return value.length;
}

/**
 * Обрабатывает Backspace самостоятельно, чтобы пользователь не упирался
 * в автоматически восстановленную скобку/дефис. Удаляется именно цифра
 * перед курсором, вплоть до состояния "+7".
 */
export function phoneOnKeyDown(
  event: React.KeyboardEvent<HTMLInputElement>,
  currentValue: string,
  onValueChange?: (nextValue: string) => void,
) {
  if (event.key !== "Backspace" || !onValueChange) return;

  const input = event.currentTarget;
  const selectionStart = input.selectionStart ?? currentValue.length;
  const selectionEnd = input.selectionEnd ?? selectionStart;

  // Выделенный фрагмент браузер удалит сам, затем onChange снова применит маску.
  if (selectionStart !== selectionEnd) return;

  const digits = normalizePhoneDigits(currentValue);
  const body = digits.slice(1);

  if (body.length === 0 || selectionStart <= 2) {
    event.preventDefault();
    onValueChange("+7");
    window.requestAnimationFrame(() => input.setSelectionRange(2, 2));
    return;
  }

  const digitsBeforeCaret = currentValue
    .slice(0, selectionStart)
    .replace(/\D/g, "").length;
  const bodyDigitsBeforeCaret = Math.max(0, digitsBeforeCaret - 1);
  const removeIndex = Math.min(body.length - 1, bodyDigitsBeforeCaret - 1);

  if (removeIndex < 0) return;

  event.preventDefault();
  const nextBody = `${body.slice(0, removeIndex)}${body.slice(removeIndex + 1)}`;
  const nextValue = formatPhone(`7${nextBody}`);
  onValueChange(nextValue);

  const desiredDigitCount = 1 + removeIndex;
  window.requestAnimationFrame(() => {
    const nextCaret = caretPositionForDigitCount(nextValue, desiredDigitCount);
    input.setSelectionRange(nextCaret, nextCaret);
  });
}

/** Извлекает полный номер из 11 цифр либо пустую строку. */
export function phoneDigits(value: string): string {
  const digits = normalizePhoneDigits(value);
  return digits.length === 11 ? digits : "";
}
