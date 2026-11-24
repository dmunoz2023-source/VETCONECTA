/** Simula una petición HTTP que responde `data` después de `delayMs` (solo mientras no exista el endpoint real). */
export function mockRequest<T>(data: T, delayMs = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delayMs));
}
