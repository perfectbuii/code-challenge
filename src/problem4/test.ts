import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "./solution";

describe("Sum to N", () => {
  test("should work for basic cases", () => {
    expect(sum_to_n_a(5)).toBe(15);
    expect(sum_to_n_b(5)).toBe(15);
    expect(sum_to_n_c(5)).toBe(15);
  });

  test("should handle zero", () => {
    expect(sum_to_n_a(0)).toBe(0);
    expect(sum_to_n_b(0)).toBe(0);
    expect(sum_to_n_c(0)).toBe(0);
  });

  test("should handle negative numbers", () => {
    expect(sum_to_n_a(-1)).toBe(0);
    expect(sum_to_n_b(-1)).toBe(0);
    expect(sum_to_n_c(-1)).toBe(0);
  });
});
