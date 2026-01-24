import app from "./server.js";
const port = parseInt(process.env.PORT || "3001");
const server = () => app.listen(port, () => console.log(`Server is running on port ${port}`));
void server();
//# sourceMappingURL=index.js.map