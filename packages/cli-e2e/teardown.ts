export default async function () {
  const cleaningPromises = [Promise.resolve()];
  if (global.processManager) {
    cleaningPromises.push(global.processManager.killAllProcesses());
  }
  await Promise.all(cleaningPromises);
}
