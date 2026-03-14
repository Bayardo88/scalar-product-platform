import { createServer } from "../src/server";
import http from "http";

function request(
  server: http.Server,
  method: string,
  path: string,
  body?: object
): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const addr = server.address() as { port: number };
    const options: http.RequestOptions = {
      hostname: "127.0.0.1",
      port: addr.port,
      path,
      method,
      headers: { "Content-Type": "application/json" },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode || 0, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode || 0, data });
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

describe("scalar-dev-bridge server", () => {
  let server: http.Server;

  beforeAll((done) => {
    const app = createServer();
    server = app.listen(0, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  it("GET /health returns status ok", async () => {
    const res = await request(server, "GET", "/health");
    expect(res.status).toBe(200);
    expect(res.data.status).toBe("ok");
    expect(typeof res.data.uptime).toBe("number");
  });

  it("POST /sync rejects invalid payload", async () => {
    const res = await request(server, "POST", "/sync", { invalid: true });
    expect(res.status).toBe(400);
    expect(res.data.ok).toBe(false);
  });

  it("POST /validate rejects invalid payload", async () => {
    const res = await request(server, "POST", "/validate", { invalid: true });
    expect(res.status).toBe(400);
    expect(res.data.ok).toBe(false);
  });

  it("POST /sync accepts a valid DesignAST payload", async () => {
    const payload = {
      version: "1.0",
      meta: {
        appName: "Test",
        designSystem: "DS/Scalar",
        mode: "lowfi",
        generatedAt: new Date().toISOString(),
      },
      routes: [{ id: "r1", path: "/dashboard", screenId: "s1" }],
      screens: [{ id: "s1", name: "Dashboard", rootNodeId: "n1" }],
      nodes: [
        {
          id: "n1",
          type: "Region",
          role: "appShell",
          name: "App Shell",
          children: [],
        },
      ],
    };

    const res = await request(server, "POST", "/sync", payload);
    expect(res.data).toHaveProperty("ok");
    expect(res.data).toHaveProperty("exportHash");
  });

  it("POST /validate accepts a valid DesignAST payload", async () => {
    const payload = {
      version: "1.0",
      meta: {
        appName: "Test",
        designSystem: "DS/Scalar",
        mode: "lowfi",
        generatedAt: new Date().toISOString(),
      },
      routes: [],
      screens: [{ id: "s1", name: "Test", rootNodeId: "n1" }],
      nodes: [
        {
          id: "n1",
          type: "Region",
          role: "appShell",
          name: "App Shell",
        },
      ],
    };

    const res = await request(server, "POST", "/validate", payload);
    expect(res.data).toHaveProperty("ok");
  });
});
