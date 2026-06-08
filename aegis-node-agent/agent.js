const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// The Radio Channel to the Central Brain
const BRAIN_URL = "http://localhost:8081/api/heal";
const TARGET_FILE = path.join(__dirname, 'target-server.js');

console.log("========================================");
console.log("🛡️ AEGIS NODE.JS SIDECAR: ONLINE");
console.log("========================================");

let currentServerProcess = null;

function startTargetServer() {
    console.log("[SIDECAR] Launching target-server.js in protective bubble...");

    currentServerProcess = spawn('node', [TARGET_FILE]);

    currentServerProcess.stdout.on('data', (data) => {
        process.stdout.write(`${data}`);
    });

    currentServerProcess.stderr.on('data', (data) => {
        const errorLog = data.toString();

        console.log("\n🚨 [CRASH DETECTED] Node.js Exception caught! 🚨");
        // Print just the first line of the error to keep the terminal clean
        console.log("-> " + errorLog.split('\n')[0]);

        // Kill the dead process completely before we start healing
        if (currentServerProcess) currentServerProcess.kill();

        initiateHealingSequence(errorLog);
    });
}

async function initiateHealingSequence(errorLog) {
    console.log("\n[SIDECAR] Reading broken source code...");
    const brokenCode = fs.readFileSync(TARGET_FILE, 'utf8');

    console.log("[SIDECAR] Transmitting JSON payload to Central Brain API (Port 8081)...");

    // We package the data exactly like the Python agent does!
    const payload = {
        language: "javascript",
        brokenCode: brokenCode,
        errorLog: errorLog
    };

    try {
        // We use Node's built-in fetch to talk to the Brain
        const response = await fetch(BRAIN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.status === 'success') {
            console.log("[SIDECAR] Patch received! Applying Hot-Swap...");

            // Overwrite the target server file with the AI's fix
            fs.writeFileSync(TARGET_FILE, data.fixedCode);

            console.log("========================================");
            console.log("⚡ RESURRECTION SEQUENCE INITIATED ⚡");
            console.log("========================================");

            startTargetServer(); // Reboot!
        } else {
            console.log("[CRITICAL] Brain returned an error: ", data.message);
        }
    } catch (error) {
        console.error("[CRITICAL] Failed to contact Central Brain. Is it running on Port 8081?");
    }
}

// Turn it on!
startTargetServer();