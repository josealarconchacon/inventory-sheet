export const startOfDayRows = [
  { key: "startLobster", label: "Total amount of Lobster brought" },
  { key: "startBuns", label: "Total amount of Buns brought" },
  { key: "startOysters", label: "Total number of Oysters brought" },
  { key: "startCaviar", label: "Total amount of Caviar brought" },
  {
    key: "startCash",
    label: "Total starting Cash (should be $200)",
    type: "number",
    step: 1,
    min: 0,
    placeholder: "200",
    prefix: "$",
  },
];

export const endOfDayRows = [
  { key: "endLobster", label: "Total amount of Lobster leftover" },
  {
    key: "endBuns",
    label: "Total number of Buns leftover",
    noteField: "endBunsBadNotes",
    noteButtonLabel: "Record bad bread",
    noteEditLabel: "Edit bad bread notes",
    noteCollapseLabel: "Close bad bread notes",
    notePlaceholder: "Add notes about bad bread or discarded buns",
    noteHint: "Track any buns that were unusable at the end of service.",
    noteExportLabel: "Bad bread notes",
    notePopupTitle: "Bad bread notes",
    noteDoneLabel: "Done",
  },
  {
    key: "endOysters",
    label: "Total number of Oysters leftover",
    noteField: "endOystersBadNotes",
    noteButtonLabel: "Record bad oysters",
    noteEditLabel: "Edit bad oyster notes",
    noteCollapseLabel: "Close bad oyster notes",
    notePlaceholder: "Add notes about bad oysters or discarded oysters",
    noteHint: "Include counts or reasons for discarding oysters.",
    noteExportLabel: "Bad oyster notes",
    notePopupTitle: "Bad oyster notes",
    noteDoneLabel: "Done",
  },
  { key: "endCaviar", label: "Total amount of Caviar leftover" },
  {
    key: "endCash",
    label: "Total Cash (including starting cash)",
    placeholder: "$",
  },
];

export const productTotalsRows = [
  {
    key: "lobster",
    label: "Total Lobster sold (amount brought minus leftover)",
  },
  {
    key: "buns",
    label: "Total Rolls sold (amount brought minus leftover)",
  },
  {
    key: "oysters",
    label: "Total Oysters sold (amount brought minus leftover)",
  },
];
