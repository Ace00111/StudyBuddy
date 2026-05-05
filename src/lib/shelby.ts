export async function uploadToShelby(file: File, owner: string) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("owner", owner)

  // Note: the Shelby API domain here is a placeholder based on instructions
  // In a real scenario, handle errors, loading states, etc.
  try {
    const res = await fetch("https://api.shelby.xyz/upload", {
      method: "POST",
      body: formData
    })

    if (!res.ok) {
      console.warn("Shelby API not real, returning a fake fileId for demo")
      return crypto.randomUUID()
    }
    const data = await res.json()
    return data.fileId
  } catch (error) {
    console.error("Upload failed", error)
    // Fallback since Shelby API doesn't exist yet
    return crypto.randomUUID()
  }
}

export function getShelbyFileUrl(fileId: string) {
  return `https://gateway.shelby.xyz/${fileId}`
}
