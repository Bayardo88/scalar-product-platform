import { createServer, printStartupInfo } from "./server";

const PORT = parseInt(process.env.SCALAR_BRIDGE_PORT || "4311", 10);

const app = createServer();

app.listen(PORT, async () => {
  await printStartupInfo(PORT);
});
