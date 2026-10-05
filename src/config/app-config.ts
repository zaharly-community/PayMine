import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "ipaycash",
  version: packageJson.version,
  copyright: `© ${currentYear}, ipaycash.`,
  meta: {
    title: "ipaycash — Payment Operations Dashboard",
    description:
      "ipaycash is a modern payment operations platform for managing players, distributors, deposits, withdrawals, transactions, settlements, reconciliation, analytics, and revenue.",
  },
};
