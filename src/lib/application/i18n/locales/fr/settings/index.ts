import navigation from "./navigation.json";
import preferences from "./preferences.json";
import serviceDeskSettings from "./serviceDeskSettings.json";

const settings = {
  ...preferences,
  ...navigation,
  ...serviceDeskSettings,
};

export default settings;
