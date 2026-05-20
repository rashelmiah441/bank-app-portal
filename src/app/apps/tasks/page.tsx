import { auth } from "@/auth"
import { getTasks } from "./actions"
import TaskList from "./TaskList"
import { redirect } from "next/navigation"

export default async function TasksPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/api/auth/signin")
  }

  const tasks = await getTasks()

  return <TaskList initialTasks={tasks} />
}
