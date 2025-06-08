const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');

const accountsRouter = require('../routes/accounts');

describe('POST /account', () => {
  let app;
  const testFile = path.join(__dirname, 'accounts-test.json');

  beforeEach(() => {
    fs.writeFileSync(testFile, JSON.stringify({ nextId: 1, accounts: [] }));
    global.fileName = testFile;
    app = express();
    app.use(express.json());
    app.use('/account', accountsRouter);
  });

  afterEach(() => {
    fs.unlinkSync(testFile);
  });

  it('should create account and return created object', async () => {
    const newAccount = { name: 'Test User', balance: 100 };
    const res = await request(app).post('/account').send(newAccount);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, ...newAccount });
  });
});
