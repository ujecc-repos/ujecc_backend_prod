const PHONE_ALLOWED_CHARACTERS = /^[+\d\s().-]+$/;

const toPhoneNumberList = (value: unknown): string[] => {
  const rawValues = Array.isArray(value) ? value : [value];

  return rawValues
    .flatMap((item) => typeof item === 'string' ? item.split(/[\n,;]+/) : [])
    .map((phoneNumber) => phoneNumber.trim().replace(/\s+/g, ' '))
    .filter(Boolean);
};

const phoneNumberKey = (phoneNumber: string): string => {
  const digits = phoneNumber.replace(/\D/g, '');
  return phoneNumber.startsWith('+') ? `+${digits}` : digits;
};

export const normalizePhoneNumbers = (value: unknown): string => {
  const seen = new Set<string>();

  return toPhoneNumberList(value)
    .filter((phoneNumber) => {
      const key = phoneNumberKey(phoneNumber);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join('\n');
};

export const getInvalidPhoneNumbers = (value: unknown): string[] =>
  toPhoneNumberList(value).filter((phoneNumber) => {
    const digitCount = phoneNumber.replace(/\D/g, '').length;
    return !PHONE_ALLOWED_CHARACTERS.test(phoneNumber) || digitCount < 7 || digitCount > 15;
  });
