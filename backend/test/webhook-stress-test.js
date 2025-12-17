require("dotenv").config({ path: "./.env" });

const http = require("http");
const { Webhook } = require("svix");

const secret = process.env.CLERK_WEBHOOK_SECRET;

if (!secret) {
    console.error("CLERK_WEBHOOK_SECRET not set in .env");
    process.exit(1);
}

// Step 1 — Create JSON string
const json = JSON.stringify({
    type: "user.created",
    data: {
        id: "test_abc123",
        email_addresses: [{ email_address: "tester@example.com" }],
        first_name: "Test",
        last_name: "User",
        image_url: "https://example.com/test.jpg"
    }
});

// Step 2 — Convert to raw buffer for signature
const payloadBuffer = Buffer.from(json, "utf8");

// Step 3 — Sign using Svix
const wh = new Webhook(secret);
const svixId = `msg_${Date.now()}`;
const now = new Date();
// sign() signature: (msgId: string, timestamp: Date, payload: string | Buffer)
const signature = wh.sign(svixId, now, payloadBuffer);

const options = {
    hostname: "localhost",
    port: 5000,
    path: "/clerk/webhook",
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "svix-id": svixId,
        "svix-timestamp": Math.floor(now.getTime() / 1000).toString(),
        "svix-signature": signature,
        "Content-Length": Buffer.byteLength(json)
    }
};

console.log("Sending webhook test...");

const req = http.request(options, (res) => {
    console.log("STATUS:", res.statusCode);
    res.setEncoding("utf8");
    res.on("data", (chunk) => {
        console.log("BODY:", chunk);
    });
});

req.on("error", (err) => {
    console.error("Request Error:", err.message);
});

req.write(json);  // IMPORTANT: send JSON string
req.end();
