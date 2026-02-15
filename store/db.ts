import Dexie, { type Table } from 'dexie';
import { ResumeState } from './useResumeStore';

export class ResumeDatabase extends Dexie {
  resumes!: Table<{ id: string; data: any; updatedAt: number }>;

  constructor() {
    super('ResumeBuilderDB');
    this.version(1).stores({
      resumes: 'id, updatedAt'
    });
  }
}

export const db = new ResumeDatabase();
