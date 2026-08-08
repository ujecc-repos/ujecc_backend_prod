"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvalidPhoneNumbers = exports.normalizePhoneNumbers = void 0;
const PHONE_ALLOWED_CHARACTERS = /^[+\d\s().-]+$/;
const toPhoneNumberList = (value) => {
    const rawValues = Array.isArray(value) ? value : [value];
    return rawValues
        .flatMap((item) => typeof item === 'string' ? item.split(/[\n,;]+/) : [])
        .map((phoneNumber) => phoneNumber.trim().replace(/\s+/g, ' '))
        .filter(Boolean);
};
const phoneNumberKey = (phoneNumber) => {
    const digits = phoneNumber.replace(/\D/g, '');
    return phoneNumber.startsWith('+') ? `+${digits}` : digits;
};
const normalizePhoneNumbers = (value) => {
    const seen = new Set();
    return toPhoneNumberList(value)
        .filter((phoneNumber) => {
        const key = phoneNumberKey(phoneNumber);
        if (!key || seen.has(key))
            return false;
        seen.add(key);
        return true;
    })
        .join('\n');
};
exports.normalizePhoneNumbers = normalizePhoneNumbers;
const getInvalidPhoneNumbers = (value) => toPhoneNumberList(value).filter((phoneNumber) => {
    const digitCount = phoneNumber.replace(/\D/g, '').length;
    return !PHONE_ALLOWED_CHARACTERS.test(phoneNumber) || digitCount < 7 || digitCount > 15;
});
exports.getInvalidPhoneNumbers = getInvalidPhoneNumbers;
