import type { InputTable } from ".";

export function normalizeWeights(table: InputTable) {
  const sum = table.weights.reduce((a, b) => a + b, 0);
  return table.weights.map((weight) => weight / sum);
}