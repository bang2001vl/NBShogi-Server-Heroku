const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(
  express.urlencoded({
    extended: true
  })
)
app.use(express.json());

app.get('/home', (req, res) =>{
    res.send("Hello world");
});

app.get('/api/auth', (req, res) =>
{
  const err = req.error;
  if(err) 
  {
    console.log("Error on /test: error = " + err);
    return;
  }
  const code = req.query.code;
  const username = req.query.username;
  console.log("code = " + code + " ; username = "+ username);

  const js = JSON.stringify(req.body);
  console.log("JSON object received = " + js);
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port, ()=>
{
  console.log("Listening on port: " + port);
});