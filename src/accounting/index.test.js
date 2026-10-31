'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { PassThrough } = require('stream');
const {
  DataStore, formatBalance, viewBalance, credit, debit, parseAmount, main,
} = require('./index');

/** Runs the menu loop with scripted input and returns everything printed. */
async function runApp(lines) {
  const input = new PassThrough();
  const output = new PassThrough();
  let text = '';
  output.on('data', (chunk) => { text += chunk; });
  const done = main(input, output);
  input.end(`${lines.join('\n')}\n`);
  await done;
  return text;
}

test('TC-001 view the initial balance', () => {
  assert.equal(viewBalance(new DataStore()), 'Current balance: 001000.00');
});

test('TC-002 credit the account', () => {
  const store = new DataStore();
  assert.equal(credit(store, 250.5), 'Amount credited. New balance: 001250.50');
  assert.equal(store.read(), 1250.5);
});

test('TC-003 debit the account', () => {
  const store = new DataStore();
  assert.equal(debit(store, 400), 'Amount debited. New balance: 000600.00');
  assert.equal(store.read(), 600);
});

test('TC-004 debit with insufficient funds leaves the balance unchanged', () => {
  const store = new DataStore();
  assert.equal(debit(store, 1500), 'Insufficient funds for this debit.');
  assert.equal(store.read(), 1000);
});

test('TC-005 debit of the exact balance succeeds', () => {
  const store = new DataStore();
  assert.equal(debit(store, 1000), 'Amount debited. New balance: 000000.00');
  assert.equal(store.read(), 0);
});

test('TC-006 balance persists across operations', () => {
  const store = new DataStore();
  credit(store, 100);
  debit(store, 50);
  assert.equal(viewBalance(store), 'Current balance: 001050.00');
});

test('TC-007 invalid menu choice shows a message and the menu again', async () => {
  const out = await runApp(['7', '4']);
  assert.match(out, /Invalid choice, please select 1-4\./);
  assert.equal(out.split('Account Management System').length - 1, 2);
});

test('TC-008 exit the application', async () => {
  const out = await runApp(['4']);
  assert.match(out, /Exiting the program\. Goodbye!/);
});

test('TC-009 balance resets for a new session', async () => {
  await runApp(['2', '500', '4']);
  const out = await runApp(['1', '4']);
  assert.match(out, /Current balance: 001000\.00/);
});

test('TC-010 credit of zero leaves the balance unchanged', () => {
  const store = new DataStore();
  assert.equal(credit(store, 0), 'Amount credited. New balance: 001000.00');
});

test('menu flow: credit then view balance through the full app', async () => {
  const out = await runApp(['2', '100', '1', '4']);
  assert.match(out, /Amount credited\. New balance: 001100\.00/);
  assert.match(out, /Current balance: 001100\.00/);
});

test('amount parsing rejects invalid input', () => {
  assert.equal(parseAmount('abc'), null);
  assert.equal(parseAmount(''), null);
  assert.equal(parseAmount('-5'), null);
  assert.equal(parseAmount('12.345'), 12.35);
});

test('balance formatting matches the COBOL PIC 9(6)V99 layout', () => {
  assert.equal(formatBalance(1000), '001000.00');
  assert.equal(formatBalance(0.5), '000000.50');
});
