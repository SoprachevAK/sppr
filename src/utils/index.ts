

export { };

declare global {
  interface Number {
    toLocalFixed(decimal: number): string;
  }
}

Number.prototype.toLocalFixed = function (decimal: number) {
  return this.toLocaleString('en-US', { maximumFractionDigits: decimal });
};

export function numberFormatToFixed(value: number, decimal: number) {
  return value.toLocaleString('en-US', { maximumFractionDigits: decimal, });
}