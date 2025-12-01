// models/AlertSettings.js - User preferences for alert notifications
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const AlertSettings = sequelize.define(
    "AlertSettings",
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
        field: "project_name",
        index: true,
        comment: "Null means global settings for all projects",
      },
      alertType: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "alert_type",
        comment:
          "Types: title_change, meta_change, content_change, status_change, broken_link, new_page, removed_page, redirect_chain, link_change",
      },
      isEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: "is_enabled",
      },
      notificationChannel: {
        type: DataTypes.STRING(20),
        defaultValue: "in_app",
        field: "notification_channel",
        comment: "Channels: email, in_app, webhook",
      },
      webhookUrl: {
        type: DataTypes.STRING(500),
        field: "webhook_url",
        validate: {
          isUrl: true,
        },
      },
      frequency: {
        type: DataTypes.STRING(20),
        defaultValue: "immediate",
        validate: {
          isIn: [["immediate", "daily", "weekly"]],
        },
        comment: "How often to send notifications",
      },
      thresholdSettings: {
        type: DataTypes.JSON,
        field: "threshold_settings",
        defaultValue: {},
        comment:
          "Custom thresholds: { wordCountDiff: 50, loadTimeIncrease: 2000, etc. }",
      },
    },
    {
      tableName: "alert_settings",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ["user_id"],
        },
        {
          fields: ["user_id", "project_name"],
        },
        {
          unique: true,
          fields: ["user_id", "project_name", "alert_type"],
        },
      ],
    }
  );

  return AlertSettings;
};
