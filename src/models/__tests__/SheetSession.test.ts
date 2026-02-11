import { describe, it, expect } from 'vitest';
import SheetSession from '../SheetSession';

describe('SheetSession Model', () => {
    it('should have a compound index on userId and updatedAt', () => {
        const indexes = SheetSession.schema.indexes();
        // Index definition is [fields, options]
        const found = indexes.find((idx: any) => idx[0].userId === 1 && idx[0].updatedAt === -1);
        expect(found).toBeDefined();
    });
});
