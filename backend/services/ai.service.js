const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const verifyReportWithAI = async (imagePath, description) => {
    try {
        const formData = new FormData();

        formData.append(
            "image",
            fs.createReadStream(imagePath)
        );

        formData.append(
            "description",
            description
        );

        const response = await axios.post(
            "http://127.0.0.1:8000/verify",
            formData,
            {
                headers: {
                    ...formData.getHeaders()
                }
            }
        );

        return response.data;

    } catch (error) {
        console.error(
            "AI service error:",
            error.response?.data || error.message
        );

        throw new Error(
            "AI verification service unavailable"
        );
    }
};

module.exports = {
    verifyReportWithAI
};