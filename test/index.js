const MiniExpress = require("../express/express");
const path = require("path");
const app = new MiniExpress();

// app.use((req, res, next) => {
//   console.log("Middleware 1");
//   next();
// })

app.get("/", (req, res) => {
  console.log(req.query);
  res.status(200).send("Hello World! GET");
});

app.post("/test", (req, res) => {
  console.log(req.headers);
  console.log(req.body);
  res.status(203).json({
    message: "Hello World! POST",
  });

  const filePath = path.join(__dirname, "../text.txt");
});
app.put("/test", (req, res) => {
  res.send("Hello World! PUT");
});
app.delete("/test", (req, res) => {
  res.send("Hello World!DELETE");
});
app.get("/file", (req, res, next) => {
  const filePath = path.join(__dirname, "../text.txt");
  res.sendFile(filePath);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
