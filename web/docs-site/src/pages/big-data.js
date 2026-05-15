import TrackPage from "../components/TrackPage.js";
import { trackCatalog } from "../data/catalog.js";

export default function BigDataPage() {
  return <TrackPage track={trackCatalog["big-data"]} />;
}

