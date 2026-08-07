import common from "./common.json";
import serviceDesk from "./serviceDesk.json";
import unsupportedBrowser from "./unsupportedBrowser.json";

const error = {
  ...common,
  ...unsupportedBrowser,
  ...serviceDesk,
};

export default error;
