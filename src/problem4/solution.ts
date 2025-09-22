// Three ways to sum to n

// Approach 1: Simple loop
// Time: O(n), Space: O(1)
export function sum_to_n_a(n: number): number {
  if (n < 0) return 0;
  
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

// Approach 2: Mathematical formula
// Time: O(1), Space: O(1)
export function sum_to_n_b(n: number): number {
  if (n < 0) return 0;
  return (n * (n + 1)) / 2;
}

// Approach 3: Recursion
// Time: O(n), Space: O(n)
export function sum_to_n_c(n: number): number {
  if (n <= 0) return 0;
  return n + sum_to_n_c(n - 1);
}