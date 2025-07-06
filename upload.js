// upload.js
function formatFeedback(feedback) {
    const sections = {
        "Strengths": [],
        "Weaknesses": [],
        "Recommendations": []
    };

    let currentSection = null;
    const lines = feedback.split('\n');

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith("**Strengths:**")) {
            currentSection = "Strengths";
        } else if (trimmedLine.startsWith("**Weaknesses:**")) {
            currentSection = "Weaknesses";
        } else if (trimmedLine.startsWith("**Recommendations:**")) {
            currentSection = "Recommendations";
        } else if (currentSection) {
            sections[currentSection].push(trimmedLine);
        }
    }

    let html = `<div id="ai-feedback-area"><h2>AI Feedback</h2>`;

    for (const section in sections) {
        if (sections[section].length > 0) {
            html += `<div class="feedback-section">
                        <h3>${section}</h3>
                        <ul>`;
            sections[section].forEach(item => {
                if (item) {
                    html += `<li>${item}</li>`;
                }
            });
            html += `</ul></div>`;
        }
    }

    html += `</div>`;
    return html;
}

document.addEventListener("DOMContentLoaded", function () {
    const fileUpload = document.getElementById("file-upload");
    const aiFeedback = document.getElementById("ai-feedback");

    fileUpload.addEventListener("change", async function () {
        const file = fileUpload.files[0];

        if (file) {
            console.log("File selected:", file.name);

            const formData = new FormData();
            formData.append("resume", file);

            try {
                const response = await fetch("http://localhost:3000/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    const contentType = response.headers.get("content-type");

                    if (contentType && contentType.includes("application/json")) {
                        const data = await response.json();
                        console.log("Upload successful:", data);

                        aiFeedback.innerHTML = formatFeedback(data.feedback);

                        if (data.resumeGenerationError) {
                            aiFeedback.innerHTML += `<br><br><strong>Resume Generation Failed:</strong> ${data.resumeGenerationError}`;
                        }
                    } else {
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "generated_resume.docx";
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                    }
                } else {
                    console.error("Upload failed:", response.status);
                    aiFeedback.textContent = "Upload failed. Please try again.";
                }
            } catch (error) {
                console.error("Error during upload:", error);
                aiFeedback.textContent = "An error occurred. Please try again.";
            }
        }
    });
});