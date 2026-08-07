import architecture from "./architecture.json";
import clientEngineering from "./client-engineering.json";
import decisions from "./decisions.json";
import development from "./development.json";
import domain from "./domain.json";
import navigation from "./navigation.json";
import overview from "./overview.json";

const documents = {
  ...navigation,
  item: {
    ...overview,
    ...architecture,
    ...domain,
    ...clientEngineering,
    ...development,
    ...decisions,
  },
};

export default documents;
