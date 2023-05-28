const MiniExpress = require("../express/express");

const app = new MiniExpress();

app.get("/", (req, res) => {});

app.post("/test", (req, res) => {
console.log(req.query);
  // res.status(203).json({ name: "test" });
  res.status(404).json(req.query);
});
app.put("/test", (req, res) => {
  res.send("Hello World! PUT");
});
app.delete("/test", (req, res) => {
  res.send("Hello World!DELETE");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
