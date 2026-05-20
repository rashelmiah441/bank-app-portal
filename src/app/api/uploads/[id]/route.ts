import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { readFile } from "fs/promises"
import { NextResponse } from "next/server"
import path from "path"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { id } = await params

  const upload = await prisma.fileUpload.findUnique({
    where: { id, userId: session.user.id }
  })

  if (!upload) {
    return new NextResponse("Not Found", { status: 404 })
  }

  try {
    const filePath = path.join(process.cwd(), upload.filePath)
    const fileBuffer = await readFile(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `inline; filename="${upload.fileName}"`,
      },
    })
  } catch (error) {
    console.error("Error reading file:", error)
    return new NextResponse("Error reading file", { status: 500 })
  }
}
