require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Create the HTTP server and the Radio Tower (Socket.io)
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } // Let the React UI listen in!
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log("========================================");
console.log("🧠 AEGIS CENTRAL BRAIN: ONLINE");
console.log("========================================");

// When the React UI connects to the radio channel
io.on('connection', (socket) => {
    console.log("[UI CONNECTED] The War Room Dashboard is now online.");
});

// The Universal Healing Endpoint (Now with Live Broadcasting!)
app.post('/api/heal', async (req, res) => {
    const { language, brokenCode, errorLog } = req.body;

    console.log(`\n[INCOMING] SOS from a [${language.toUpperCase()}] Agent!`);

    // 📻 BROADCAST 1: Tell React the system just crashed!
    io.emit('system_event', {
        state: 'CRASHED',
        log: `<span class='text-red'>🚨 [${language.toUpperCase()} NODE CRASH] 🚨</span><br/><span class='text-red'>${errorLog.split('\n').pop()}</span>`
    });

    try {
        // 📻 BROADCAST 2: Tell React the AI is taking over!
        setTimeout(() => {
            io.emit('system_event', {
                state: 'HEALING',
                log: `<span class='text-purple'>[AEGIS BRAIN] Uplinking to Neural Network... drafting patch for ${language.toUpperCase()}.</span>`
            });
        }, 1500); // Slight delay for cinematic effect

        const prompt = `Fix this ${language} code. ERROR: ${errorLog}. CODE: ${brokenCode}. Return only the raw fixed code.`;
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);

        let fixedCode = result.response.text().replace(/```[a-z]*\n/gi, '').replace(/```/g, '').trim();

        // 📻 BROADCAST 3: Tell React the surgery was successful!
        io.emit('system_event', {
            state: 'HEALTHY',
            log: `<span class='text-cyan'>⚡ [${language.toUpperCase()}] RESURRECTION INITIATED ⚡</span><br/>Patch sent to Sidecar Agent.`
        });

        res.status(200).json({ status: 'success', fixedCode: fixedCode });

    } catch (error) {
        console.error("[CRITICAL] Neural Network failure:", error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Start the server!
server.listen(8081, () => {
    console.log("📡 Listening for SOS signals and UI connections on Port 8081...");
});