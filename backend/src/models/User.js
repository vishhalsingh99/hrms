import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },

    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    lastName: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { len: [6, 50] }
    },

    role: {
        type: DataTypes.ENUM("employee", "manager", "admin"),
        allowNull: false,
        defaultValue: "employee"
    },

    refreshToken: {
        type: DataTypes.STRING
    },

    isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    otp: {
        type: DataTypes.STRING(6),        // 6 digit OTP
        allowNull: true
    },

    otpExpires: {
        type: DataTypes.DATE,
        allowNull: true
    },

    resetOtp: {
        type: DataTypes.STRING(6),
        allowNull: true
    },

    resetOtpExpires: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'users',
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcryptjs.genSalt(10);
                user.password = await bcryptjs.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password') && user.password) {
                const salt = await bcryptjs.genSalt(10);
                user.password = await bcryptjs.hash(user.password, salt);
            }
        }
    }
});


// Instance Method
User.prototype.comparePassword = async function (candidatePassword) {
    return await bcryptjs.compare(candidatePassword, this.password);
};

// Password hide karne ke liye (Best Practice)
User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
};


User.prototype.generateAccessToken = function () {
    return jwt.sign(
        {
            id: this.id,
            email: this.email,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

User.prototype.generateRefreshToken = function () {
    return jwt.sign(
        {
            id: this.id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export default User;