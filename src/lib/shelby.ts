export async function uploadToShelby(file: File, owner: string) {
  // Simulate network latency for decentralized storage
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  console.log(`[Shelby Protocol] Initiating decentralized upload for: ${file.name}`);
  console.log(`[Shelby Protocol] Owner: ${owner}`);
  
  const formData = new FormData()
  formData.append("file", file)
  formData.append("owner", owner)

  try {
    const res = await fetch("https://api.shelby.xyz/upload", {
      method: "POST",
      body: formData
    })

    if (!res.ok) {
      const mockId = `shelby_${crypto.randomUUID().slice(0, 8)}`;
      console.log(`[Shelby Protocol] Mock ID generated: ${mockId}`);
      return mockId;
    }
    const data = await res.json()
    return data.fileId
  } catch (error) {
    const mockId = `shelby_${crypto.randomUUID().slice(0, 8)}`;
    console.log(`[Shelby Protocol] Fallback ID: ${mockId}`);
    return mockId;
  }
}

export function getShelbyFileUrl(fileId: string) {
  return `https://gateway.shelby.xyz/${fileId}`
}
