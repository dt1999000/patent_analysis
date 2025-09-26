import { createFileRoute } from "@tanstack/react-router";
import Index from "@/components/pages/Index";

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
});

function Dashboard() {
  return <Index />;
}
