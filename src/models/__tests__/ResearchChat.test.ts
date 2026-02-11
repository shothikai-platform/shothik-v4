import ResearchChat from '../ResearchChat';
import { describe, it, expect } from 'vitest';

describe('ResearchChat Model', () => {
    it('should have a compound index on userId and updatedAt', () => {
        const indexes = ResearchChat.schema.indexes();
        const compoundIndex = indexes.find((index: any) => {
            const keys = index[0];
            return keys.userId === 1 && keys.updatedAt === -1;
        });
        expect(compoundIndex).toBeDefined();
    });
});
