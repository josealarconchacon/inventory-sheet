export const startOfDayRows = [
  { key: "startLobster", label: "Total amount of Lobster brought" },
  { key: "startBuns", label: "Total amount of Buns brought" },
  { key: "startOysters", label: "Total number of Oysters brought" },
  { key: "startCaviar", label: "Total amount of Caviar brought" },
  {
    key: "startCash",
    label: "Total starting Cash (should be $200)",
    readOnly: true,
    prefix: "$",
  },
];

export const endOfDayRows = [
  { key: "endLobster", label: "Total amount of Lobster leftover" },
  { key: "endBuns", label: "Total number of Buns leftover" },
  { key: "endOysters", label: "Total number of Oysters leftover" },
  { key: "endCaviar", label: "Total amount of Caviar leftover" },
  {
    key: "endCash",
    label: "Total Cash (including starting cash)",
    placeholder: "$",
  },
];
