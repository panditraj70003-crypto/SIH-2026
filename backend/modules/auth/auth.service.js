const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authModel = require("./auth.model");

const registerUser = async (name, email, password) => {
    const existingUser = await authModel.findUserByEmail(email);

    if (existingUser) {
        throw new Error("User with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await authModel.createUser(
        name,
        email,
        passwordHash
    );

    return user;
};

const loginUser = async (email, password) => {
    // 1. Find user by email
    const user = await authModel.findUserByEmail(email);

    if (!user) {
        throw new Error("Invalid email or password");
    }

    // 2. Compare entered password with hashed password
    const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    // 3. Generate JWT token
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    // 4. Return safe user data and token
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
};

module.exports = {
    registerUser,
    loginUser
};