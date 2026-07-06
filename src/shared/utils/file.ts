export async function fileToNumberArray(file: File): Promise<number[]> {
  const buffer = await file.arrayBuffer();

  return Array.from(new Uint8Array(buffer));
}
