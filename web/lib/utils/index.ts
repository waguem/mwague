export function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char: any) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

export function decodeToken(token: string) {
  return JSON.parse(Buffer.from(token!.split(".")[1], "base64").toString());
}
