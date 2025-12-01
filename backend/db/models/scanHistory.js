// Database schema for scan history - Enhanced for change detection
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ScanHistory = sequelize.define(
    "ScanHistory",
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
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        index: true,
        comment: "Primary URL being scanned",
      },
      scanDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "scan_date",
      },
      pagesScanned: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "pages_scanned",
      },
      seoScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "seo_score",
      },
      metrics: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: "Overall metrics for the scan",
      },
      recommendations: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      scanData: {
        type: DataTypes.JSON,
        allowNull: false,
        field: "scan_data",
        comment:
          "Detailed scan data: { pages: [{ url, title, meta, headings, wordCount, status, links, loadTime }] }",
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment: "Additional metadata",
      },
      nextScanDate: {
        type: DataTypes.DATE,
        field: "next_scan_date",
      },
    },
    {
      tableName: "scan_histories",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ["user_id", "project_name"],
        },
        {
          fields: ["url"],
        },
        {
          fields: ["scan_date"],
        },
      ],
    }
  );

  ScanHistory.associate = (models) => {
    ScanHistory.hasMany(models.Alert, {
      foreignKey: "scanHistoryId",
      as: "alerts",
    });
  };

  return ScanHistory;
};
