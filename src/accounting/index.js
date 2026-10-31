'use strict';

/**
 * Node.js port of the legacy COBOL accounting system.
 *
 * Original programs merged into this single file:
 *   - main.cob       -> main() menu loop
 *   - operations.cob -> viewBalance(), credit(), debit()
 *   - data.cob       -> DataStore (read/write of the stored balance)
 *
 * Business rules preserved:
 *   - The balance starts at 1000.00 and lives only in memory.
 *   - A credit always succeeds and adds to the balance.
 *   - A debit is rejected when the amount is greater than the balance.
 */

const readline = require('readline');

const INITIAL_BALANCE = 1000.0;

/** Data layer (data.cob): holds the balance and supports READ and WRITE. */
class DataStore {
  constructor(initialBalance = INITIAL_BALANCE) {
    this.storageBalance = initialBalance;
  }

  read() {
    return this.storageBalance;
  }

  write(balance) {
    this.storageBalance = balance;
  }
}

/** Formats a balance like the COBOL PIC 9(6)V99 field, e.g. 001000.00. */
function formatBalance(balance) {
  return balance.toFixed(2).padStart(9, '0');
}

/** Rounds to cents so floating point noise never reaches the balance. */
function toCents(amount) {
  return Math.round(amount * 100) / 100;
}

/** View Balance (operation TOTAL). */
function viewBalance(store) {
  return `Current balance: ${formatBalance(store.read())}`;
}

/** Credit Account (operation CREDIT): reads, adds the amount and writes back. */
function credit(store, amount) {
  const newBalance = toCents(store.read() + amount);
  store.write(newBalance);
  return `Amount credited. New balance: ${formatBalance(newBalance)}`;
}

/** Debit Account (operation DEBIT): only succeeds when balance >= amount. */
function debit(store, amount) {
  const balance = store.read();
  if (balance >= amount) {
    const newBalance = toCents(balance - amount);
    store.write(newBalance);
    return `Amount debited. New balance: ${formatBalance(newBalance)}`;
  }
  return 'Insufficient funds for this debit.';
}

const MENU = [
  '--------------------------------',
  'Account Management System',
  '1. View Balance',
  '2. Credit Account',
  '3. Debit Account',
  '4. Exit',
  '--------------------------------',
].join('\n');

/** Parses an amount typed by the user; returns null when it is not valid. */
function parseAmount(text) {
  const amount = Number(text);
  if (text.trim() === '' || !Number.isFinite(amount) || amount < 0) {
    return null;
  }
  return toCents(amount);
}

/** Main menu loop (main.cob). Input and output are injectable for testing. */
async function main(input = process.stdin, output = process.stdout) {
  const store = new DataStore();
  const rl = readline.createInterface({ input, output, terminal: false });
  const lines = rl[Symbol.asyncIterator]();
  const print = (text) => output.write(`${text}\n`);
  const ask = async (prompt) => {
    print(prompt);
    const { value, done } = await lines.next();
    return done ? null : value;
  };

  let keepRunning = true;
  while (keepRunning) {
    print(MENU);
    const choice = await ask('Enter your choice (1-4): ');
    if (choice === null) {
      break;
    }

    switch (choice.trim()) {
      case '1':
        print(viewBalance(store));
        break;
      case '2':
      case '3': {
        const isCredit = choice.trim() === '2';
        const answer = await ask(`Enter ${isCredit ? 'credit' : 'debit'} amount: `);
        const amount = answer === null ? null : parseAmount(answer);
        if (amount === null) {
          print('Invalid amount, please enter a positive number.');
        } else {
          print(isCredit ? credit(store, amount) : debit(store, amount));
        }
        break;
      }
      case '4':
        keepRunning = false;
        break;
      default:
        print('Invalid choice, please select 1-4.');
    }
  }

  print('Exiting the program. Goodbye!');
  rl.close();
}

if (require.main === module) {
  main();
}

module.exports = {
  DataStore, INITIAL_BALANCE, formatBalance, viewBalance, credit, debit, parseAmount, main,
};
