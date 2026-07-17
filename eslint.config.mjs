import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: ["preview/**", ".next/**", ".next-*/**"] },
  ...nextVitals,
  ...nextTypescript,
];

export default eslintConfig;
