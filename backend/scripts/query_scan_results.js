import db from '../db/init.js';

// Query the most recent scan_results row and print selected columns
const query = `SELECT id, scan_id, performance_score, seo_score, accessibility_score, best_practices_score, mobile_scores, desktop_scores, meta_data, issues FROM scan_results ORDER BY id DESC LIMIT 1`;

db.all(query, (err, rows) => {
  if (err) {
    console.error('Failed to query scan_results:', err.message);
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log('No scan_results rows found');
    process.exit(0);
  }

  // Print nicely
  console.log(JSON.stringify(rows[0], null, 2));
  process.exit(0);
});
