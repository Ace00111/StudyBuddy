export type Material = {
  id: string
  name: string
  type: "file" | "link"
  category: "lectures" | "notes" | "assignments" | "links" | "general"
  shelbyId?: string
  url?: string
  createdAt: string
  size?: number
  folder?: string
}

export type FolderInfo = {
  id: string
  name: string
  color?: string
  notesCount: number
  sizeMb: number
}
