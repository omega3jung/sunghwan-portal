import architecture from "./architecture.json";
import decisions from "./decisions.json";
import domain from "./domain.json";
import engineering from "./engineering.json";
import navigation from "./navigation.json";
import overview from "./overview.json";
import releases from "./releases.json";

const documents = {
  ...navigation,
  item: {
    ...overview,
    ...architecture,
    ...domain,
    ...engineering,
    ...releases,
    ...decisions,
  },
};

export default documents;
