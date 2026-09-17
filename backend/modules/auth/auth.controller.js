const authService = require("./auth.service");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const user = await authService.registerUser(
            name,
            email,
            password
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await authService.loginUser(
            email,
            password
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    register,
    login
};