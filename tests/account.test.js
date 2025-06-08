const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');

const accountsRouter = require('../routes/accounts');

describe('Account routes', () => {
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

  it('creates an account and returns the created object', async () => {
    const newAccount = { name: 'Test User', balance: 100 };
    const res = await request(app).post('/account').send(newAccount);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, ...newAccount });
  });

  it('lists all accounts', async () => {
    const accounts = [
      { id: 1, name: 'Alice', balance: 100 },
      { id: 2, name: 'Bob', balance: 50 }
    ];
    fs.writeFileSync(
      testFile,
      JSON.stringify({ nextId: 3, accounts })
    );

    const res = await request(app).get('/account');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ accounts });
  });

  it('fetches an account by id', async () => {
    const accounts = [
      { id: 1, name: 'Alice', balance: 100 },
      { id: 2, name: 'Bob', balance: 50 }
    ];
    fs.writeFileSync(
      testFile,
      JSON.stringify({ nextId: 3, accounts })
    );

    const res = await request(app).get('/account/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(accounts[0]);
  });

  it('updates an account', async () => {
    const accounts = [
      { id: 1, name: 'Alice', balance: 100 }
    ];
    fs.writeFileSync(
      testFile,
      JSON.stringify({ nextId: 2, accounts })
    );

    const updated = { id: 1, name: 'Alice Updated', balance: 150 };
    const res = await request(app).put('/account').send(updated);
    expect(res.status).toBe(200);

    const json = JSON.parse(fs.readFileSync(testFile, 'utf8'));
    expect(json.accounts[0]).toEqual(updated);
  });

  it('deletes an account', async () => {
    const accounts = [
      { id: 1, name: 'Alice', balance: 100 }
    ];
    fs.writeFileSync(
      testFile,
      JSON.stringify({ nextId: 2, accounts })
    );

    const res = await request(app).delete('/account/1');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Registro excluído com sucesso!');

    const json = JSON.parse(fs.readFileSync(testFile, 'utf8'));
    expect(json.accounts.length).toBe(0);
  });

  it('performs a transaction and returns the updated account', async () => {
    const accounts = [
      { id: 1, name: 'Alice', balance: 100 }
    ];
    fs.writeFileSync(
      testFile,
      JSON.stringify({ nextId: 2, accounts })
    );

    const res = await request(app)
      .post('/account/transaction')
      .send({ id: 1, value: 50 });
    expect(res.status).toBe(200);

    const json = JSON.parse(fs.readFileSync(testFile, 'utf8'));
    expect(json.accounts[0].balance).toBe(150);
  });
});
