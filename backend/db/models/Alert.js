// models/Alert.js - Stores detected changes and alerts
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Alert = sequelize.define(
    "Alert",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "user_id",
        index: true,
      },
      projectName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "project_name",
        index: true,
      },
      alertType: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "alert_type",
        index: true,
        comment:
          "Types: title_change, meta_change, content_change, status_change, broken_link, new_page, removed_page, redirect_chain, link_change",
      },
      severity: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "info",
        validate: {
          isIn: [["critical", "warning", "info"]],
        },
      },
      pageUrl: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: "page_url",
      },
      changeDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "change_description",
      },
      oldValue: {
        type: DataTypes.TEXT,
        field: "old_value",
      },
      newValue: {
        type: DataTypes.TEXT,
        field: "new_value",
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "is_read",
      },
      scanHistoryId: {
        type: DataTypes.INTEGER,
        field: "scan_history_id",
        references: {
          model: "ScanHistories",
          key: "id",
        },
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment:
          "Additional context like word count difference, affected pages count, etc.",
      },
    },
    {
      tableName: "alerts",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ["user_id", "project_name"],
        },
        {
          fields: ["created_at"],
        },
        {
          fields: ["is_read"],
        },
        {
          fields: ["severity"],
        },
      ],
    }
  );

  Alert.associate = (models) => {
    Alert.belongsTo(models.ScanHistory, {
      foreignKey: "scanHistoryId",
      as: "scan",
    });
  };

  return Alert;
};
