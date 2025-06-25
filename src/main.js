import { getTransactions, getTransactionsByMonth, insertTransaction } from './supabaseClient.js';
import { totalTransactions } from './utils.js';
import {signIn, signOut, checkSession } from './auth.js';


// -----------
// Authentication
// -----------
// Login popup
const loginPopup = document.querySelector('.login-popup');
const signInButton = document.querySelector('.sign-in-button');
const submitEmail = document.querySelector('.login-popup .submit-button');
signInButton.addEventListener('click', async () => {
    loginPopup.style.display = 'block';
    document.querySelector('.bg-cover').style.display = 'block';
    submitEmail.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = document.querySelector('.login-popup .email-input').value;
      const password = document.querySelector('.login-popup .password-input').value;
      console.log(email);
      await signIn(email, password);
      document.querySelector('.bg-cover').style.display = 'none';
      document.querySelector('.login-popup').style.display = 'none';
      checkingUserSession();
  })
});





// -----------
// Insert Transactions
// -----------
// Insert transaction data
let insertDate = '';
let insertDescription = '';
let insertType = '';
let insertAmount = 0;

// Adding transactions
const addButton = document.querySelectorAll('.add-button');

// Check session
async function checkingUserSession() {
  try {
    const user = await checkSession();
    console.log(user);
    if (user === null) {
      addButton.forEach(button => {
        button.disabled = true;
        button.style.cursor = 'not-allowed';
        button.style.display = 'none';
      })
      document.querySelector('.sign-in-button').style.display = 'block';
    } else {
      addButton.forEach(button => {
        button.disabled = false;
        button.style.cursor = 'pointer';
        button.style.display = 'inline-block';
      })
      document.querySelector('.sign-in-button').style.display = 'none';
    }
  } catch (error) {
    console.error('Error checking session:', error);
    throw error;
  }
};
document.addEventListener('DOMContentLoaded', checkingUserSession)

// Get user Id
async function getUser() {
  try {
    const user = await checkSession();
    // console.log(user.id); (Uncomment to see the user id log)
    return user.id;
  } catch (error) {
    console.error('Error checking session:', error);
    throw error;
  }
};

// Add event listener for close button
const closeButton = document.querySelectorAll('.close-button');
if (closeButton) {
  closeButton.forEach(closeButton => closeButton.addEventListener('click', () => {
    document.querySelector('.sidebar').classList.remove('open');
    document.querySelector('.login-popup').style.display = 'none';
    document.querySelector('.bg-cover').style.display = 'none';
  }));
}

// Add event listener for submit button
const submitButton = document.querySelector('.submit-button');
if (submitButton) {
  submitButton.addEventListener('click', async () => {
    insertDate = document.querySelector('input[type="date"]').value;
    insertDescription = document.querySelector('textarea.description-input').value;
    insertAmount = document.querySelector('input[type="number"]').value;
    const userId = await getUser();
    
    if (insertDate && insertDescription && insertAmount) {
      await insertTransaction(insertDate, insertDescription, insertType, insertAmount, userId);
      // Clear the form
      document.querySelector('input[type="date"]').value = '';
      document.querySelector('textarea.description-input').value = '';
      document.querySelector('input[type="number"]').value = '';
      document.querySelector('.sidebar').classList.remove('open');
      // Clear existing log
      const deleteExsistingLog = document.querySelectorAll('tr');
      deleteExsistingLog.forEach(log => log.remove());
      // Refresh the transactions list
      await logTransactions();
    }
  });
}

// Add event listeners for add buttons
addButton.forEach(button => {
  button.addEventListener('click', () => {
    document.querySelector('.sidebar').classList.add('open');
    
    if (button.textContent === 'Add Income') {
      document.querySelector('.transaction-type').textContent = 'Pemasukan';
      insertType = 'Pemasukan';
    } else if (button.textContent === 'Add Expense') {
      document.querySelector('.transaction-type').textContent = 'Pengeluaran';
      insertType = 'Pengeluaran';
    }
  });
});


// -----------
// Transactions History, Balance, & Total Transactions
// -----------
// Initialize arrays to store the transactions data
let dates = [];
let descriptions = [];
let types = [];
let amounts = [];
let monthlyIncome = [];
let monthlyExpense = [];

// Function to fetch transactions history
async function logTransactions() {
  try {
    const transactions = await getTransactions();
    const transactionsByMonth = await getTransactionsByMonth(new Date().getMonth() + 1, new Date().getFullYear());
    // Sort transactions by date in descending order (newest to oldest)
    transactions.reverse();

    if (!transactions || transactions.length === 0) {
      console.log('No transactions found.');
      return;
    }


    // TESTING (Uncomment to see the transactions log)
    // console.log(transactions);
    // console.log(transactionsByMonth);
    

    // Fetching specific data
    descriptions = transactions.map(tx => tx.description);
    dates = transactions.map(tx => tx.date);
    types = transactions.map(tx => tx.type);
    amounts = transactions.map(tx => tx.amount);
    monthlyIncome = transactionsByMonth.map(tx => tx.amount);
    monthlyExpense = transactionsByMonth.map(tx => tx.amount);
    const monthlyTypes = transactionsByMonth.map(tx => tx.type);


    // Non-Databased data (total income, expense, & balance)
    let initialBalance = 0;
    let newBalance = 0;
    const totalIncome = totalTransactions(transactions, amounts, types, 'Pemasukan');
    const totalExpenses = totalTransactions(transactions, amounts, types, 'Pengeluaran');
    const currentBalance = totalIncome - totalExpenses;
    const totalMonthlyIncome = totalTransactions(transactionsByMonth, monthlyIncome, monthlyTypes, 'Pemasukan');
    const totalMonthlyExpense = totalTransactions(transactionsByMonth, monthlyExpense, monthlyTypes, 'Pengeluaran');
    // TESTING (Uncomment to see the non-database data)
    // console.log('Total Income:', totalIncome);
    // console.log('Total Expenses:', totalExpenses);
    // console.log('Current Balance:', currentBalance);
    // console.log('Total Monthly Income:', totalMonthlyIncome);
    // console.log('Total Monthly Expense:', totalMonthlyExpense);
  

    // Existing DOM Elements
    const totalIncomeCard = document.querySelector('.total-incomes');
    const totalExpensesCard = document.querySelector('.total-expenses');
    const balanceCard = document.querySelector('.current-balance');
    const tableBody = document.querySelector('.table-body');
    const monthlyIncomes = document.querySelector('.monthly-incomes');
    const monthlyExpenses = document.querySelector('.monthly-expenses');
    
    // Manipulate DOM with the transactions data
    for (let i = 0; i < transactions.length; i++) {
      // Create table contents elements
      const transactionRecord = document.createElement('tr');
      const transactionDate = document.createElement('td');
      const transactionDescription = document.createElement('td');
      const transactionType = document.createElement('td');
      const typeBadge = document.createElement('span');
      const transactionAmount = document.createElement('td');
      const transactionInitialBalance = document.createElement('td');
      const transactionNewBalance = document.createElement('td');
      // Append Child
      tableBody.appendChild(transactionRecord);
      transactionRecord.appendChild(transactionDate);
      transactionRecord.appendChild(transactionDescription);
      transactionRecord.appendChild(transactionType);
      transactionType.appendChild(typeBadge);
      transactionRecord.appendChild(transactionAmount);
      transactionRecord.appendChild(transactionInitialBalance);
      transactionRecord.appendChild(transactionNewBalance);
      // Styles
      typeBadge.classList.add('badge');
      if (types[i] === 'Pemasukan') {
        typeBadge.classList.add('bg-success');
      } else if (types[i] === 'Pengeluaran') {
        typeBadge.classList.add('bg-danger');
      } else if (types[i] === 'Hutang') {
        typeBadge.classList.add('bg-warning');
      } else if (types[i] === 'Piutang') {
        typeBadge.classList.add('bg-primary');
      }
      transactionAmount.classList.add('text-success');
      // Update table contents with the transactions data
      transactionDate.textContent = dates[i];
      transactionDescription.textContent = descriptions[i];
      typeBadge.textContent = types[i];
      transactionAmount.textContent = amounts[i].toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
      
      // Initial & new balance calculation
      // Set initial balance for the first transaction (last index)
      if (i === 0) {
        initialBalance = 0;
      } else {
        // Use the new balance as the initial balance for the next transaction
        initialBalance = newBalance;
      }
      
      // Calculate new balance
      if (types[i] === 'Pemasukan' || types[i] === 'Hutang') {
        newBalance = initialBalance + amounts[i];
      } else {
        newBalance =  initialBalance - amounts[i];
        transactionAmount.textContent = `-${amounts[i].toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}`;
        transactionAmount.classList.add('text-danger');
      }
      
      // Update balance displays
      transactionInitialBalance.textContent = initialBalance.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
      transactionNewBalance.textContent = newBalance.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });

    }
    // Sort table rows back to ascending order (oldest to newest)
    const rows = Array.from(tableBody.children);
    rows.sort((a, b) => new Date(b.children[0].textContent) - new Date(a.children[0].textContent));
    rows.forEach(row => tableBody.appendChild(row));

    // Update non-database data displays (total income, expenses, monthly income, monthly expenses & balance)
    totalIncomeCard.textContent = totalIncome.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
    totalExpensesCard.textContent = totalExpenses.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
    monthlyIncomes.textContent = totalMonthlyIncome.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
    monthlyExpenses.textContent = totalMonthlyExpense.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
    balanceCard.textContent = currentBalance.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
    if (currentBalance < 0) {
      balanceCard.classList.add('text-danger');
    } else {
      balanceCard.classList.add('text-success');
    }

  } catch (error) {
    console.error('Error loading transactions:', error);
  }
}

// Call the log function when the script loads
document.addEventListener('DOMContentLoaded', logTransactions);