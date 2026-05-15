import TrackPage from "../components/TrackPage.js";
import { trackCatalog } from "../data/catalog.js";

export default function AIAgentsPage() {
  return <TrackPage track={trackCatalog["ai-agents"]} />;
}

