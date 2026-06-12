import { prisma } from '../../src/lib/prisma.js';

class MockDocument {
  userId: string;
  collectionName: string;

  constructor(collectionName: string, userId: string) {
    this.collectionName = collectionName;
    this.userId = userId;
  }

  async set(data: any, options?: any) {
    if (this.collectionName === 'subscriptions') {
      const { updatedAt, createdAt, ...rest } = data;
      const cleanData: any = {};
      for (const k in rest) {
        if (rest[k] !== undefined && typeof rest[k] !== 'function') {
          cleanData[k] = rest[k];
        }
      }
      
      // format dates if present
      if (cleanData.nextPaymentDate && typeof cleanData.nextPaymentDate === 'string') {
        cleanData.nextPaymentDate = new Date(cleanData.nextPaymentDate).toISOString();
      }
      if (cleanData.lastPaymentDate && typeof cleanData.lastPaymentDate === 'string') {
        cleanData.lastPaymentDate = new Date(cleanData.lastPaymentDate).toISOString();
      }

      return await prisma.subscription.upsert({
        where: { userId: this.userId },
        update: cleanData,
        create: { userId: this.userId, status: cleanData.status || 'pending', plan: cleanData.plan || 'basico', amount: cleanData.amount || 0, ...cleanData }
      });
    } else if (this.collectionName === 'users') {
      const { updatedAt, createdAt, ...rest } = data;
      const cleanData: any = {};
      for (const k in rest) {
        if (rest[k] !== undefined && typeof rest[k] !== 'function') {
          cleanData[k] = rest[k];
        }
      }
      return await prisma.userProfile.upsert({
        where: { uid: this.userId },
        update: cleanData,
        create: { uid: this.userId, name: cleanData.name || 'Doutor', tenantId: this.userId, role: 'doctor', onboardingComplete: false, ...cleanData }
      });
    }
  }

  async get() {
    if (this.collectionName === 'subscriptions') {
      const sub = await prisma.subscription.findUnique({ where: { userId: this.userId } });
      return {
        exists: !!sub,
        data: () => sub
      };
    }
    return {
      exists: false,
      data: () => null
    };
  }
}

class MockCollection {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  doc(id: string) {
    return new MockDocument(this.name, id);
  }
}

class MockFirestore {
  collection(name: string) {
    return new MockCollection(name);
  }
}

export const firestore = new MockFirestore();
export const admin = {
  firestore: {
    FieldValue: {
      serverTimestamp: () => new Date()
    }
  }
};
