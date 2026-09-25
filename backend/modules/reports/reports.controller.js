
const reportsService = require("./reports.service");


const createReport = async (req, res) => {
    try {
        const {
            latitude,
            longitude,
            description,
            severity
        } = req.body;

        // Report submission is public.
        // If a user is logged in, keep their ID.
        // Otherwise, save the report as a guest report.
        const userId = req.user?.id || null;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image is required"
            });
        }

        const report = await reportsService.createReport(
            userId,
            Number(latitude),
            Number(longitude),
            description,
            severity,
            req.file.path
        );

        res.status(201).json({
            success: true,
            message: "Report submitted successfully",
            data: report
        });

    } catch (error) {
        console.error("Report creation error:", error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getMyReports = async (req, res) => {
    try {
        const userId = req.user.id;

        const reports = await reportsService.getMyReports(userId);

        res.status(200).json({
            success: true,
            data: reports
        });

    } catch (error) {
        console.error("Fetching reports error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch reports"
        });
    }
};

module.exports = {
    createReport,
    getMyReports
};