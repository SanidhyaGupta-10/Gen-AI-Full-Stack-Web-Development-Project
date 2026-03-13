import { generateResumePdf } from "./src/services/ai.service";
import "dotenv/config";
import fs from "fs";

async function test() {
    try {
        console.log("Testing PDF generation...");
        const buffer = await generateResumePdf({
            resume: "Sample resume content for a software engineer with 5 years of experience in React and Node.js.",
            selfDescription: "I am a passionate developer who loves building scalable web applications.",
            jobDescription: "Senior Full Stack Developer role requiring expertise in React, Node.js, and TypeScript."
        });
        fs.writeFileSync("test_resume.pdf", buffer);
        console.log("PDF generated successfully: test_resume.pdf");
        process.exit(0);
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
}

test();
