/**
 * Checks if a value is a string.
 *
 * @param value The value to check.
 * @returns True if the value is a string, false otherwise.
 */
const isString = (value: any): value is string =>
  typeof value === 'string';

/**
 * Trims a string and removes excess newlines.
 *
 * @param value The string to trim.
 * @returns The trimmed string or an empty string if the input is not valid.
 */
const trimify = (value: any): string =>
  isString(value) ? value.replace(/\n\n\s*\n/g, '\n\n').trim() : '';

export default trimify;