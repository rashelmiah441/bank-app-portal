"use client"
import { useState, useRef } from "react"
import { createTask, updateTask, deleteTask } from "./actions"
import { useReactToPrint } from "react-to-print"
import Link from "next/link"

type Task = {
  id: string
  title: string
  description: string | null
  completed: boolean
  createdAt: Date
}

export default function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [newTitle, setNewTitle] = useState("")
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "My Task List",
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    const task = await createTask(newTitle)
    setTasks([task, ...tasks])
    setNewTitle("")
  }

  const handleToggle = async (task: Task) => {
    const updated = await updateTask(task.id, { completed: !task.completed })
    setTasks(tasks.map(t => t.id === task.id ? updated : t))
  }

  const handleDelete = async (id: string) => {
    await deleteTask(id)
    setTasks(tasks.filter(t => t.id !== id))
  }

  const handleDescriptionChange = async (id: string, description: string) => {
    // Local update for UI responsiveness
    setTasks(tasks.map(t => t.id === id ? { ...t, description } : t))
    
    // Autosave logic (debounce could be added here, but for simplicity let's just do it on blur or use a timer)
  }

  const saveDescription = async (id: string, description: string) => {
    await updateTask(id, { description })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link href="/apps/dashboard" className="text-blue-600 hover:underline flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
          </div>
          <button
            onClick={() => handlePrint()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            Print Task List
          </button>
        </div>

        <form onSubmit={handleCreate} className="mb-8 flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md"
          >
            Add Task
          </button>
        </form>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all ${
                task.completed ? "opacity-75" : ""
              }`}
            >
              <div className="p-4 flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(task)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span
                  className={`flex-1 text-lg font-medium cursor-pointer ${
                    task.completed ? "line-through text-gray-400" : "text-gray-900"
                  }`}
                  onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                >
                  {task.title}
                </span>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
              
              {expandedTaskId === task.id && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                    Description (Autosaves on blur)
                  </label>
                  <textarea
                    defaultValue={task.description || ""}
                    onBlur={(e) => saveDescription(task.id, e.target.value)}
                    placeholder="Add more details about this task..."
                    className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-h-[100px] text-gray-700"
                  />
                </div>
              )}
            </div>
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400">No tasks yet. Add one above to get started!</p>
            </div>
          )}
        </div>

        {/* Print Layout */}
        <div className="hidden">
          <div ref={printRef} className="p-12 text-gray-900 bg-white">
            <h1 className="text-3xl font-bold mb-8 border-b pb-4">Task List</h1>
            <div className="space-y-6">
              {tasks.map((task) => (
                <div key={task.id} className="border-b pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-4 h-4 border border-black rounded ${task.completed ? "bg-black" : ""}`} />
                    <span className={`text-xl font-bold ${task.completed ? "line-through" : ""}`}>
                      {task.title}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-gray-600 pl-7 italic whitespace-pre-wrap">
                      {task.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-12 pt-4 border-t text-xs text-gray-400">
              Generated by App Portal - {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
