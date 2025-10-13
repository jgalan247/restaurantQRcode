// Quick test of the price formatting utilities

function parsePrice(price) {
  if (typeof price === 'number') {
    return price;
  }
  const parsed = parseFloat(price);
  return isNaN(parsed) ? 0 : parsed;
}

function formatPrice(price) {
  const num = parsePrice(price);
  return num.toFixed(2);
}

function formatCurrency(price) {
  return `$${formatPrice(price)}`;
}

// Test cases
console.log('Testing price formatters:');
console.log('------------------------');

// Test with strings (as returned from backend)
console.log('String "2.50":', formatCurrency("2.50")); // Should be $2.50
console.log('String "12.99":', formatCurrency("12.99")); // Should be $12.99
console.log('String "3.5":', formatCurrency("3.5")); // Should be $3.50

// Test with numbers
console.log('\nNumbers:');
console.log('Number 2.5:', formatCurrency(2.5)); // Should be $2.50
console.log('Number 12.99:', formatCurrency(12.99)); // Should be $12.99
console.log('Number 3:', formatCurrency(3)); // Should be $3.00

// Test calculations
console.log('\nCalculations:');
const itemPrice = parsePrice("12.50");
const modifierPrice = parsePrice("2.00");
const quantity = 2;
const total = (itemPrice + modifierPrice) * quantity;
console.log(`Item: ${formatCurrency(itemPrice)}`);
console.log(`Modifier: ${formatCurrency(modifierPrice)}`);
console.log(`Quantity: ${quantity}`);
console.log(`Total: ${formatCurrency(total)}`); // Should be $29.00

// Test edge cases
console.log('\nEdge cases:');
console.log('Empty string "":', formatCurrency("")); // Should be $0.00
console.log('Invalid "abc":', formatCurrency("abc")); // Should be $0.00
console.log('Zero 0:', formatCurrency(0)); // Should be $0.00

console.log('\n✅ All price formatting tests completed!');
