import { getCustomRepository } from 'typeorm';
import { Router } from 'express';
import multer from 'multer';
import uploadConfig from '../config/upload';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionRepository.find({ select: ["id", "title", "type", "value", "created_at", "updated_at"], relations: ["category"]});
  const balance = await transactionRepository.getBalance(transactions);

  const result = {
    "transactions": transactions,
    "balance": balance
  }

  return response.json(result);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({title, value, type, category});

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute(id);

  return response.send(204);
});

transactionsRouter.post('/import', upload.single('file'), async (request, response) => {
  const { file } = request;

  const importTransaction = new ImportTransactionsService();

  const transactions = await importTransaction.execute(file.filename);

  return response.json(transactions);
});

export default transactionsRouter;
