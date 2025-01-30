// app/api/user/routes.ts

// GET /api/user/tasks
// Get user's tasks (both created and participated)
export async function GET(req: Request) {
  // Uses combination of:
  // - getTaskIdToTask()
  // - hasParticipated()
  // Filters by user address
}
