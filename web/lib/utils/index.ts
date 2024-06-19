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

export const countryList = [
  { value: "Mali", label: "Mali", code: "ML" },
  { value: "China", label: "China", code: "CN" },
  { value: "Turkey", label: "Turkey", code: "TR" },
  { value: "USA", label: "United States", code: "US" },
  { value: "France", label: "France", code: "FR" },
  { value: "Ivory Cost", label: "Ivory Cost", code: "CI" },
  { value: "Guinea", label: "Guinea", code: "GN" },
  { value: "Burkina Faso", label: "Burkina Faso", code: "BF" },
  { value: "United Arab Emirates", label: "United Arab Emirates", code: "AE" },
  { value: "Mozambique", label: "Mozambique", code: "MZ" },
];

export const countryOptions = countryList.map((option) => ({
  value: option.value,
  label: `${getFlagEmoji(option.code)} ${option.label}`,
}));

export const agentTypeOptions = [
  { value: "AGENT", label: "Agent" },
  { value: "SUPPLIER", label: "Supplier" },
];
