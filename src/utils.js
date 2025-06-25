// Balance calculation function
export function totalTransactions(transactions, amounts, typeData, transactionType) {
  let total = 0;
  for (let i = 0; i < transactions.length; i++) {
    if (typeData[i] === transactionType) {
      total += amounts[i];
      console.log(amounts[i]);
    }
  }
  console.log(total);
  return total;
}