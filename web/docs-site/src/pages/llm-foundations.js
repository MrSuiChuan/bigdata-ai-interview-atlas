import TrackPage from "../components/TrackPage.js";
import { trackCatalog } from "../data/catalog.js";

export default function LLMFoundationsPage() {
  return <TrackPage track={trackCatalog["llm-foundations"]} />;
}

