import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    // TODO

    if (!title) {
      throw new AppError('Title must be not null');
    }
    if (typeof title !== 'string') {
      throw new AppError('Title must be a string');
    }
    if (!value) {
      throw new AppError('Value must be not null');
    }
    if (typeof value !== 'number') {
      throw new AppError('Value must be a number');
    }
    if (!type) {
      throw new AppError('Type must be not null');
    }
    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Type must be income or outcome');
    }
    const getBalance = getCustomRepository(TransactionRepository);
    const { total } = await getBalance.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enough balance');
    }

    const transactionRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);

    let categoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryExists) {
      categoryExists = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(categoryExists);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryExists?.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
