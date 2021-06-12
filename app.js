const express = require("express");
const app = express();
const PORT = 8000;

app.use(express.static("public"));
app.get('/favicon.ico', express.static('favicon.ico'));
app.use("/styles", express.static(`${__dirname}/styles`));
app.use("/scripts", express.static(`${__dirname}/scripts`));
app.use("/images", express.static(`${__dirname}/images`));


const server = app.listen(PORT, () => {
    console.log("Server started at http://localhost:%s", PORT);
});
