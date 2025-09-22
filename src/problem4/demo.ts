import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from './solution';

console.log('Testing three ways to sum to n:');

const testValues = [5, 10, 100];

testValues.forEach(n => {
  console.log(`\nn = ${n}:`);
  console.log(`  Iterative: ${sum_to_n_a(n)}`);
  console.log(`  Formula:   ${sum_to_n_b(n)}`);
  console.log(`  Recursive: ${sum_to_n_c(n)}`);
});