type SettingsTheme = {
  bg: `bg-${string}`;
  icon: `text-${string}`;
  hover: `hover:outline-${string}`;
};

export const SETTINGS_THEME: readonly SettingsTheme[] = [
  { bg: "bg-primary/70", icon: "text-primary", hover: "hover:outline-primary" },
  {
    bg: "bg-iturquoise/70",
    icon: "text-iturquoise",
    hover: "hover:outline-iturquoise",
  },
  { bg: "bg-ipink/70", icon: "text-ipink", hover: "hover:outline-ipink" },
  {
    bg: "bg-iskyblue/70",
    icon: "text-iskyblue",
    hover: "hover:outline-iskyblue",
  },
  { bg: "bg-iorange/70", icon: "text-iorange", hover: "hover:outline-iorange" },
  { bg: "bg-iblue/70", icon: "text-iblue", hover: "hover:outline-iblue" },
  { bg: "bg-isalmon/70", icon: "text-isalmon", hover: "hover:outline-isalmon" },
  { bg: "bg-iyellow/70", icon: "text-iyellow", hover: "hover:outline-iyellow" },
  {
    bg: "bg-ipinkdark/70",
    icon: "text-ipinkdark",
    hover: "hover:outline-ipinkdark",
  },
  { bg: "bg-ililac/70", icon: "text-ililac", hover: "hover:outline-ililac" },
  {
    bg: "bg-iskyblue2/70",
    icon: "text-iskyblue2",
    hover: "hover:outline-iskyblue2",
  },
  { bg: "bg-igreen/70", icon: "text-igreen", hover: "hover:outline-igreen" },
] as const;
