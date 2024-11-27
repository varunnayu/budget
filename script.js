// Select elements
const form = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const dateInput = document.getElementById('date');
const transactionsList = document.getElementById('transactions-list');
const incomeElement = document.getElementById('income');
const expenseElement = document.getElementById('expense');
const balanceElement = document.getElementById('balance');
const filterForm = document.getElementById('filter-form');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const filteredTransactionsList = document.getElementById('filtered-transactions-list');

// Chart.js instance
let chartInstance = null;

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Update the UI
function updateUI() {
    transactionsList.innerHTML = '';
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;

    // Update totals
    incomeElement.textContent = income;
    expenseElement.textContent = expense;
    balanceElement.textContent = balance;

    // Render transactions
    transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.classList.add(transaction.type);
        li.innerHTML = `
            ${transaction.description} (₹${transaction.amount}, ${transaction.date})
            <button onclick="editTransaction(${transaction.id})">Edit</button>
            <button onclick="deleteTransaction(${transaction.id})">Delete</button>
        `;
        transactionsList.appendChild(li);
    });

    // Save to localStorage
    localStorage.setItem('transactions', JSON.stringify(transactions));

    // Update the chart
    updateChart(income, expense);
}

// Add a transaction
form.addEventListener('submit', e => {
    e.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;
    const date = dateInput.value;

    if (description && !isNaN(amount) && type && date) {
        const transaction = {
            id: Date.now(),
            description,
            amount,
            type,
            date
        };
        transactions.push(transaction);
        updateUI();

        // Reset form
        descriptionInput.value = '';
        amountInput.value = '';
        typeInput.value = '';
        dateInput.value = '';
    } else {
        alert('Please fill out all fields');
    }
});

// Delete a transaction
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateUI();
}

// Edit a transaction
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
        descriptionInput.value = transaction.description;
        amountInput.value = transaction.amount;
        typeInput.value = transaction.type;
        dateInput.value = transaction.date;

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.textContent = 'Update Transaction';

        form.onsubmit = function (e) {
            e.preventDefault();

            transaction.description = descriptionInput.value.trim();
            transaction.amount = parseFloat(amountInput.value);
            transaction.type = typeInput.value;
            transaction.date = dateInput.value;

            if (transaction.description && !isNaN(transaction.amount) && transaction.type && transaction.date) {
                updateUI();

                descriptionInput.value = '';
                amountInput.value = '';
                typeInput.value = '';
                dateInput.value = '';
                submitButton.textContent = 'Add Transaction';
                form.onsubmit = null;
                form.addEventListener('submit', addTransactionHandler);
            } else {
                alert('Please fill out all fields');
            }
        };
    }
}

// Filter transactions by date
filterForm.addEventListener('submit', e => {
    e.preventDefault();

    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    if (startDate && endDate) {
        const filteredTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= startDate && transactionDate <= endDate;
        });

        renderFilteredTransactions(filteredTransactions);
    }
});

// Render filtered transactions
function renderFilteredTransactions(filteredTransactions) {
    filteredTransactionsList.innerHTML = '';
    filteredTransactions.forEach(transaction => {
        const li = document.createElement('li');
        li.classList.add(transaction.type);
        li.innerHTML = `
            ${transaction.description} (₹${transaction.amount}, ${transaction.date})
        `;
        filteredTransactionsList.appendChild(li);
    });
}

// Update the chart
function updateChart(income, expense) {
    const ctx = document.getElementById('transaction-chart').getContext('2d');

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Income', 'Expense'],
            datasets: [
                {
                    data: [income, expense],
                    backgroundColor: ['#28a745', '#dc3545']
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

// Initial render
updateUI();
