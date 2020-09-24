import AppError from '../errors/AppError';
import { getCustomRepository, getRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome'
  category: string;
}

class CreateTransactionService {
  public async execute({title, value, type, category}: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);
    let categoryId = null;

    const categoryDatabase = await categoryRepository.findOne({
      where: { title: category}
    });

    if(categoryDatabase){
      categoryId = categoryDatabase.id;
    } else {
      const newCategory = await categoryRepository.create({
        title: category
      });

      await categoryRepository.save(newCategory);
      categoryId = newCategory.id;
    }

    if(type === "outcome"){
      const transactions = await transactionRepository.find();
      const balance = await transactionRepository.getBalance(transactions);

      if(balance.total < value){
        throw new AppError("Insufficients funds", 400);
      }
    }

    const transaction = await transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryId
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
