import sequelize from "../config/database.js";
import User from "./User.js";
import Company from "./Company.js";

// ✅ Associations
Company.hasMany(User, { foreignKey: "companyId" });
User.belongsTo(Company, { foreignKey: "companyId" });

// export all
export {
  sequelize,
  User,
  Company
};