const express = require('express');

const app = express();
const port = 3000;


app.get('/', async (req, res) => {
    res.json({message: 'Hello world!'});
});


app.listen(port, (userDB, ) => {
  console.log(`Server running at http://localhost:${port}`)
  console.log('To shutdown the server: Ctrl + C')
})
