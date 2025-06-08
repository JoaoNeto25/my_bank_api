var express = require("express");
var fs = require("fs");
var router = express.Router();

// implementando o método POST
router.post("/", (req, res) => {
  let account = req.body;
  fs.readFile(global.fileName, "utf8", (err, data) => {
    try {
      if (err) throw (err);
      let json = JSON.parse(data);
      // fazendo a incrementação do id de forma automática
      account = { id: json.nextId++, ...account };
      json.accounts.push(account);

      fs.writeFile(global.fileName, JSON.stringify(json), err => {
        if (err) {
          res.status(400).send({ error: err.message });
        } else {
          res.send(account);
        }
      });
    } catch (err) {
      res.status(400).send({ error: err.message });

    };
  });
});

// Implementando o metodo GET
router.get("/", (_, res) => {

  fs.readFile(global.fileName, "utf8", (err, data) => {
    try {
      if (err) throw (err);
      let json = JSON.parse(data);
      delete json.nextId; // deletar campo de proximo id
      res.send(json);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });
});

// Implementando método GET por id
router.get("/:id", (req, res) => {
  fs.readFile(global.fileName, "utf8", (err, data) => {
    try {
      if (err) throw (err);

      // usando .find para transformar o id de string para int
      let json = JSON.parse(data);
      const account = json.accounts.find(account => account.id === parseInt(req.params.id, 10));
      if (account) {
        res.send(account);
      } else {
        res.send();
      }
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });
});
// Implementando o método delete
router.delete("/:id", (req, res) => {
  fs.readFile(global.fileName, "utf8", (err, data) => {
    try {
      if (err) throw err;
      let json = JSON.parse(data);
      let accounts = json.accounts.filter(account => account.id !== parseInt(req.params.id, 10));
      json.accounts = accounts;

      fs.writeFile(global.fileName, JSON.stringify(json), err => {
        if (err) {
          res.status(400).send({ error: err.message });
        } else {
          res.send("Registro excluído com sucesso!");
        }
      });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });
});

router.put("/", (req, res) => {
  let newAccount = req.body;
  fs.readFile(global.fileName, "utf8", (err, data) => {
    try {
      if (err) throw err;

      let json = JSON.parse(data);
      let oldIndex = json.accounts.findIndex(account => account.id === newAccount.id);
      // garantir que não vai gravar nada além dos campos
      json.accounts[oldIndex].name = newAccount.name;
      json.accounts[oldIndex].balance = newAccount.balance;

      fs.writeFile(global.fileName, JSON.stringify(json), err => {
        if (err) {
          res.status(400).send({ error: err.message });
        } else {
          res.send();
        }
      });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });
});

router.post('/transaction', (req, res) => {
  let params = req.body;
  fs.readFile(global.fileName, "utf8", (err, data) => {
    try {
      if (err) throw err;

      let json = JSON.parse(data);
      let index = json.accounts.findIndex(account => account.id === params.id);

      if ((params.value < 0) && ((json.accounts[index].balance + params.value) < 0)) {
        throw new Error("Não Há saldo suficiente");
      }

      json.accounts[index].balance += params.value;

      fs.writeFile(global.fileName, JSON.stringify(json), err => {
        if (err) {
          res.status(400).send({ error: err.message });
        } else {
          res.send(json.accounts[index]);
        }
      });
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  });
});

module.exports = router;