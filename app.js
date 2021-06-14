import express from "express";
const app = express();
const PORT = 8000;

app.use(express.static("public"));
app.get('/favicon.ico', express.static('favicon.ico'));
app.use("/styles", express.static(`styles`));
app.use("/scripts", express.static(`scripts`));
app.use("/images", express.static(`images`));


const server = app.listen(PORT, () => {
    console.log("Server started at http://localhost:%s", PORT);
});
