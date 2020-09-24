import { getRepository } from 'typeorm';
import path from 'path';
import fs from 'fs';
import uploadConfig from '../config/upload';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

class ImportTransactionsService {
  async execute(fileName: string): Promise<Transaction[]> {
    const filePath = path.join(uploadConfig.directory, fileName);
    const data = await fs.readFileSync(filePath, 'utf8').toString().split("\n");
    data.splice(0,1);

    console.log(data);

    const transactions: Transaction[] = [];
    const transactionRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);

    for (const line of data) {
      const [title, type, value, category] = line.split(", ");

      if(title){
        let categoryId = null;

        const categoryDatabase = await categoryRepository.findOne({
          where: { title: category.trimLeft()}
        });

        if(categoryDatabase){
          categoryId = categoryDatabase.id;
        } else {
          const newCategory = await categoryRepository.create({
            title: category.trimLeft()
          });

          await categoryRepository.save(newCategory);

          categoryId = newCategory.id;
        }

        const newTransaction = await transactionRepository.create({
          title: title,
          value: parseFloat(value) | 0,
          type: type === "outcome" ? type : "income",
          category_id: categoryId
        });

        await transactionRepository.save(newTransaction);

        transactions.push(newTransaction);
      }
    }

    return transactions;
  }
}

export default ImportTransactionsService;
