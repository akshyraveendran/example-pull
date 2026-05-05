import { createFileRoute } from "@tanstack/react-router";
import { App } from "@/components/layout/App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Granander — A Horizontal Journey" },
      {
        name: "description",
        content:
          "An immersive horizontal scrolling experience through heritage, cuisine, wine, rooms, spa, and summer.",
      },
      { property: "og:title", content: "Granander — A Horizontal Journey" },
      {
        property: "og:description",
        content: "Heritage, cuisine, wine, rooms, spa, and summer — explored sideways.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <App />;
}
