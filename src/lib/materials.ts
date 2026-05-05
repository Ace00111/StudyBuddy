export type Material = {
  id: string
  name: string
  type: "file" | "link"
  shelbyId?: string
  url?: string
  createdAt: string
  size?: number // for the UI mock
  folder?: string // for the UI mock
}

export type FolderInfo = {
  id: string
  name: string
  color?: string
  notesCount: number
  sizeMb: number
}
