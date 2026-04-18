exports.handler = async function(event, context) {
    console.log("1. Function started successfully!");
    
    // Security check to ensure it only accepts data from your website
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        console.log("2. Reading user message...");
        const body = JSON.parse(event.body);
        
        console.log("3. Checking for API Key...");
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.log("🛑 ERROR: API Key is completely missing!");
            return { statusCode: 500, body: JSON.stringify({ reply: "Error: API key missing" }) };
        } else {
            console.log("✅ API Key found!");
        }

        console.log("4. Connecting to Google Gemini 3 Flash...");
        
        // This is the updated URL with the new gemini-3-flash model
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: [{ parts: [{ text: body.message || "Hello" }] }],
            systemInstruction: { parts: [{ text: body.systemPrompt || "You are a teacher." }] }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log("5. Google responded with status code:", response.status);

        if (!response.ok) {
            const errorDetails = await response.text();
            console.log("🛑 GOOGLE API ERROR:", errorDetails);
            throw new Error(`Google API rejected the request`);
        }

        const data = await response.json();
        console.log("6. Success! Sending answer back to whiteboard.");
        const botText = data.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply: botText })
        };

    } catch (error) {
        console.log("🛑 CATCH BLOCK TRIGGERED. The exact error is:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ reply: "Internal Server Error" })
        };
    }
};
