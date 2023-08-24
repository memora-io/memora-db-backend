export default async function sleep(ms: number): Promise<null> {
  return await new Promise((resolve) => {
    setTimeout(() => resolve(null), ms);
  });
}