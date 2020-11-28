import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
// import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
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
  }: RequestDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();
    if (type === 'outcome' && total < value) {
      throw new AppError(
        'You do not have enough balance to make this transaction.',
      );
    }

    let transacationCategory = await categoriesRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!transacationCategory) {
      transacationCategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(transacationCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transacationCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
