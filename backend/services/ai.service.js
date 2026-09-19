
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function verifyReportWithAI(imagePath, description) {
    const formData = new FormData();

    formData.append(
        "file",
        fs.createReadStream(imagePath)
    );

    try {
        const response = await axios.post(
            "http://127.0.0.1:8000/detect-landslide",
            formData,
            {
                headers: formData.getHeaders(),
                timeout: 30000
            }
        );

        const predictions = response.data.predictions || [];

        let aiStatus = "needs_more_evidence";
        let aiConfidence = null;
        let aiObservations = "No landslide detected";

        if (predictions.length > 0) {
            const highestPrediction = predictions.reduce(
                (highest, current) =>
                    current.confidence > highest.confidence
                        ? current
                        : highest
            );

            aiConfidence = highestPrediction.confidence;

            aiStatus = "landslide_detected";

            aiObservations =
                `Detected ${highestPrediction.class} with ` +
                `${(aiConfidence * 100).toFixed(2)}% confidence`;
        }

        return {
            ai_status: aiStatus,
            ai_confidence: aiConfidence,
            ai_observations: aiObservations,
            predictions: predictions
        };

    } catch (error) {
        console.error(
            "AI Service Error:",
            error.response?.data || error.message
        );

        throw new Error("AI verification failed");
    }
}

module.exports = {
    verifyReportWithAI
};