import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/inventory')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/inventory"!</div>
}
