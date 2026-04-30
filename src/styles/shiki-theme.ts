import type { ThemeRegistration } from "shiki";

export const gruvboxMaterialDark: ThemeRegistration = {
  name: "gruvbox-material-dark",
  type: "dark",
  colors: {
    "editor.background": "#282828",
    "editor.foreground": "#d4be98",
  },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#928374", fontStyle: "italic" } },
    { scope: ["string", "string.quoted", "string.template"], settings: { foreground: "#a9b665" } },
    { scope: ["constant.numeric", "constant.language"], settings: { foreground: "#d3869b" } },
    { scope: ["constant.character", "constant.other"], settings: { foreground: "#d3869b" } },
    { scope: ["keyword", "keyword.control", "storage.type", "storage.modifier"], settings: { foreground: "#ea6962" } },
    { scope: ["entity.name.function", "support.function", "meta.function-call"], settings: { foreground: "#a9b665" } },
    { scope: ["entity.name.class", "entity.name.type", "support.class", "support.type"], settings: { foreground: "#d8a657" } },
    { scope: ["variable", "variable.parameter", "variable.other"], settings: { foreground: "#d4be98" } },
    { scope: ["variable.language"], settings: { foreground: "#ea6962", fontStyle: "italic" } },
    { scope: ["operator", "keyword.operator"], settings: { foreground: "#e78a4e" } },
    { scope: ["punctuation"], settings: { foreground: "#d4be98" } },
    { scope: ["entity.other.attribute-name"], settings: { foreground: "#7daea3" } },
    { scope: ["entity.name.tag"], settings: { foreground: "#ea6962" } },
    { scope: ["meta.tag"], settings: { foreground: "#d4be98" } },
    { scope: ["markup.heading"], settings: { foreground: "#d8a657", fontStyle: "bold" } },
    { scope: ["markup.bold"], settings: { fontStyle: "bold" } },
    { scope: ["markup.italic"], settings: { fontStyle: "italic" } },
    { scope: ["markup.inline.raw"], settings: { foreground: "#89b482" } },
    { scope: ["string.regexp"], settings: { foreground: "#e78a4e" } },
  ],
};
