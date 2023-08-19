const fs = require("fs-extra");
const axios = require("axios");

module.exports.config = {
    name: "fyt2",
    version: "1.0.0",
    hasPermssion: 2,
    credits: "MR CHAND",
    description: "War In Chatbox",
    commandCategory: "wargroup",
    usages: "[fyt]",
    cooldowns: 7,
    dependencies: {
        "fs-extra": "",
        "axios": ""
    }
}

module.exports.run = async function({ api, args, Users, event}) {
    const mention = Object.keys(event.mentions)[0];
    if (!mention) {
        return api.sendMessage("Please mention the target user to send messages to.", event.threadID);
    }
    
    const targetID = mention;
    const notepadFilePath = "path/to/notepad/files"; // Replace with the actual path
    
    // Ask for notepad files and time interval
    api.sendMessage(`Please add the notepad files to the following path: ${notepadFilePath}`, event.threadID);
    api.sendMessage("Please specify the time interval in seconds between messages.", event.threadID);

    const intervalInSeconds = parseInt(await new Promise(resolve => {
        api.listenMqtt("sendMessage", async (error, event) => {
            if (error) return;
            if (event.type !== "message") return;
            
            const receivedMessage = event.body;
            if (!isNaN(receivedMessage)) {
                resolve(receivedMessage);
            }
        });
    }));

    api.sendMessage("Please provide the path to the cookies file for the logged-in Facebook account.", event.threadID);

    const cookiesFilePath = await new Promise(resolve => {
        api.listenMqtt("sendMessage", async (error, event) => {
            if (error) return;
            if (event.type !== "message") return;

            const receivedMessage = event.body;
            resolve(receivedMessage);
        });
    });

    // Read cookies from the cookies file
    const cookies = JSON.parse(await fs.readFile(cookiesFilePath, "utf-8"));

    // Configure axios to use the cookies for authentication
    const axiosInstance = axios.create({
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
            "cookie": cookies.join("; ")
        }
    });

    // Read files from notepad directory
    const files = await fs.readdir(notepadFilePath);

    const a = async function (message) {
        await axiosInstance.post("https://graph.facebook.com/v14.0/me/messages", {
            recipient: { id: targetID },
            message: { text: message }
        });

        await new Promise(resolve => setTimeout(resolve, intervalInSeconds * 1000)); // Convert seconds to milliseconds
    }

    for (const file of files) {
        const fileContent = await fs.readFile(`${notepadFilePath}/${file}`, "utf-8");
        await a(fileContent);
    }
}
