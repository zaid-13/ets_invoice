const express = require("express");
const app = express();
const { createInvoice } = require("./services/invoice/createInvoice.js");
const path = require("path");

const bodyParser = require("body-parser");

const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.json("hello world!");
});

app.get("/home", (req, res) => {
    res.json({ name: "home" });
});

app.post("/download_invoice", (req, res) => {
    const data = req.body;
    const fileName = "INV" + data.invoiceNumber + ".pdf";
    createInvoice(data, fileName);
    res.download(path.join(__dirname, fileName));
});

app.listen(port, () => {
    console.log("App listening to port ", port);
})