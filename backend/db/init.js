import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data directory exists
const dataDir = join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, "scans.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err);
    process.exit(1);
  }
});

// Create tables
db.serialize(() => {
  // Scans table
  db.run(`CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        error TEXT
    )`);

  // Results table
  db.run(`CREATE TABLE IF NOT EXISTS scan_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scan_id INTEGER NOT NULL,
        performance_score REAL,
        seo_score REAL,
        accessibility_score REAL,
        best_practices_score REAL,
        meta_data TEXT,
        issues TEXT,
        mobile_scores TEXT,
        desktop_scores TEXT,
        FOREIGN KEY (scan_id) REFERENCES scans(id)
    )`);

  // Link checks table
  db.run(`CREATE TABLE IF NOT EXISTS link_checks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        total_links INTEGER,
        broken_count INTEGER,
        redirects_count INTEGER,
        images_broken INTEGER,
        results TEXT
    )`);

  // Rank tracker keywords table
  db.run(`CREATE TABLE IF NOT EXISTS rank_keywords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        keyword TEXT NOT NULL,
        last_position INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME,
        active INTEGER DEFAULT 1,
        UNIQUE(url, keyword)
    )`);

  // Rank history table
  db.run(`CREATE TABLE IF NOT EXISTS rank_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        keyword_id INTEGER NOT NULL,
        position INTEGER,
        fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(keyword_id) REFERENCES rank_keywords(id)
    )`);

  // Rank alerts table
  db.run(`CREATE TABLE IF NOT EXISTS rank_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        keyword_id INTEGER NOT NULL,
        old_position INTEGER,
        new_position INTEGER,
        delta INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        seen INTEGER DEFAULT 0,
        FOREIGN KEY(keyword_id) REFERENCES rank_keywords(id)
    )`);

  // Scan history table for change detection
  db.run(`CREATE TABLE IF NOT EXISTS scan_histories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        project_name TEXT NOT NULL,
        url TEXT NOT NULL,
        scan_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        pages_scanned INTEGER DEFAULT 0,
        seo_score INTEGER,
        metrics TEXT,
        recommendations TEXT,
        scan_data TEXT,
        metadata TEXT,
        next_scan_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

  // Alerts table
  db.run(`CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        project_name TEXT NOT NULL,
        alert_type TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'info',
        page_url TEXT NOT NULL,
        change_description TEXT NOT NULL,
        old_value TEXT,
        new_value TEXT,
        is_read INTEGER DEFAULT 0,
        scan_history_id INTEGER,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(scan_history_id) REFERENCES scan_histories(id)
    )`);

  // Alert settings table
  db.run(`CREATE TABLE IF NOT EXISTS alert_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        project_name TEXT,
        alert_type TEXT NOT NULL,
        is_enabled INTEGER DEFAULT 1,
        notification_channel TEXT DEFAULT 'in_app',
        webhook_url TEXT,
        frequency TEXT DEFAULT 'immediate',
        threshold_settings TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, project_name, alert_type)
    )`);

  // Payment orders table
  db.run(`CREATE TABLE IF NOT EXISTS payment_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL UNIQUE,
        user_id TEXT NOT NULL,
        plan_type TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'USD',
        status TEXT NOT NULL,
        capture_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        captured_at DATETIME
    )`);

  // Subscriptions table
  db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL UNIQUE,
        plan_type TEXT NOT NULL,
        status TEXT NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        paypal_order_id TEXT,
        paypal_capture_id TEXT,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

  // Users table (if not exists)
  db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firebase_uid TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        display_name TEXT,
        subscription_plan TEXT DEFAULT 'free',
        subscription_status TEXT DEFAULT 'inactive',
        scan_limit INTEGER DEFAULT 10,
        scans_used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

  // Create indexes for better performance
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_scan_histories_user_id ON scan_histories(user_id)`
  );
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_scan_histories_project ON scan_histories(project_name)`
  );
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_scan_histories_url ON scan_histories(url)`
  );
  db.run(`CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id)`);
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_alerts_project ON alerts(project_name)`
  );
  db.run(`CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON alerts(is_read)`);
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_alert_settings_user_id ON alert_settings(user_id)`
  );
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON payment_orders(user_id)`
  );
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status)`
  );
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)`
  );
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status)`
  );

  console.log("Database initialized successfully!");
  // Ensure new columns are present for existing databases created before this change
  db.all("PRAGMA table_info('scan_results')", (err, cols) => {
    if (err) {
      console.error("Failed to check scan_results table info:", err.message);
      return;
    }

    const names = Array.isArray(cols) ? cols.map((c) => c.name) : [];

    if (!names.includes("mobile_scores")) {
      db.run(
        "ALTER TABLE scan_results ADD COLUMN mobile_scores TEXT",
        (alterErr) => {
          if (alterErr)
            console.error(
              "Failed to add mobile_scores column:",
              alterErr.message
            );
          else console.log("Added column mobile_scores to scan_results");
        }
      );
    }

    if (!names.includes("desktop_scores")) {
      db.run(
        "ALTER TABLE scan_results ADD COLUMN desktop_scores TEXT",
        (alterErr) => {
          if (alterErr)
            console.error(
              "Failed to add desktop_scores column:",
              alterErr.message
            );
          else console.log("Added column desktop_scores to scan_results");
        }
      );
    }
  });
});

export default db;
