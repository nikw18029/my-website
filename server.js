const http = require("http");
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const PORT = 3000;
const baseDir = __dirname;

/* =====================
   DATABASE CONNECTION
===================== */

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

let usersCollection;

async function connectDB() {
    try {
        await client.connect();
        const db = client.db("mydb");
        usersCollection = db.collection("users");

        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}

connectDB();

/* =====================
   STATIC FILE SERVING
===================== */

const mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".json": "application/json"
};

function serveFile(res, filePath) {
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || "application/octet-stream";

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Page not found");
            return;
        }

        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
    });
}

/* =====================
   SERVER
===================== */

const server = http.createServer((req, res) => {

    if (req.method === "POST") {

        if (req.url === "/register") {
            let body = "";

            req.on("data", chunk => {
                body += chunk.toString();
            });

            req.on("end", async () => {
                try {
                    const { firstname, lastname, username, email, password } = JSON.parse(body);

                    const existingUser = await usersCollection.findOne({
                        $or: [
                            { email: email },
                            { username: username }
                        ]
                    });

                    if (existingUser) {
                        res.writeHead(400, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({
                            error: "Email or username already registered"
                        }));
                    }

                    await usersCollection.insertOne({
                        firstname,
                        lastname,
                        username,
                        email,
                        password
                    });

                    res.writeHead(201, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: "Registration successful" }));

                } catch (err) {
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Database error" }));
                }
            });

            return;
        }

        if (req.url === "/login") {
            let body = "";

            req.on("data", chunk => {
                body += chunk.toString();
            });

            req.on("end", async () => {
                try {
                    const { email, password } = JSON.parse(body);

                    const user = await usersCollection.findOne({ email, password });

                    if (!user) {
                        res.writeHead(401, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ error: "Invalid credentials" }));
                    }

                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: "Login successful" }));

                } catch (err) {
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Database error" }));
                }
            });

            return;
        }

        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("POST route not found");
        return;
    }

    if (req.method === "GET") {
        let filePath;

        if (req.url === "/") {
            filePath = path.join(baseDir, "index.html");
        }
        else if (path.extname(req.url)) {
            filePath = path.join(baseDir, req.url);
        }
        else {
            filePath = path.join(baseDir, req.url + ".html");
        }

        return serveFile(res, filePath);
    }

    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method not allowed");
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});