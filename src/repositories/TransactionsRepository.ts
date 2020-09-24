import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(transactions: Transaction[]): Promise<Balance> {
    const incomes = transactions.filter(
      transaction => transaction.type === 'income',
    );

    const outcomes = transactions.filter(
      transaction => transaction.type === 'outcome',
    );

    const incomeSum = incomes.reduce((sum, item) => {
      return sum + item.value;
    }, 0);

    const outcomeSum = outcomes.reduce((sum, item) => {
      return sum + item.value;
    }, 0);

    const balance = {
      income: incomeSum,
      outcome: outcomeSum,
      total: incomeSum - outcomeSum,
    };

    return balance;
  }
}

export default TransactionsRepository;
