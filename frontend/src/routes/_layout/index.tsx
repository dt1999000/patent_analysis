import { Box, Container, Text } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import Index from "@/components/pages/Index";

import useAuth from "@/hooks/useAuth";

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
});

function Dashboard() {
  const { user: currentUser } = useAuth();

  return (
    <Container maxW="full">
      <Index></Index>
    </Container>
  );
}
