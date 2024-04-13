import Dexie, { Table } from 'dexie';
import { InjectionToken, makeEnvironmentProviders } from '@angular/core';

export interface TodoList {
  id?: number;
  title: string;
}

export interface TodoItem {
  id?: number;
  todoListId: number;
  title: string;
  done?: boolean;
}

export interface ITodoDb {
  todoItems: Table<TodoItem, number>;
  todoLists: Table<TodoList, number>;
}

class TodoDb extends Dexie implements ITodoDb {
  public todoItems!: Table<TodoItem, number>;
  public todoLists!: Table<TodoList, number>;

  constructor() {
    super('todoDb');
    this.version(1).stores({
      todoLists: '++id',
      todoItems: '++id, todoListId',
    });
    this.on('populate', () => this.populate());
  }

  async populate() {
    const todoListId = await db.todoLists.add({
      title: 'To Do Today',
    });
    await db.todoItems.bulkAdd([
      {
        todoListId,
        title: 'Feed the birds',
      },
      {
        todoListId,
        title: 'Watch a movie',
      },
      {
        todoListId,
        title: 'Have some sleep',
      },
    ]);
  }
}
const db = new TodoDb();

export const DATABASE = new InjectionToken<ITodoDb>('Database abstraction');

export function provideDatabase() {
  return makeEnvironmentProviders([
    { provide: DATABASE, useValue: db }
  ]);
}
