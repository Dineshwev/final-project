// services/changeDetectionService.js - Detects changes between scans
import db from "../db/init.js";

class ChangeDetectionService {
  /**
   * Compare two scans and detect changes
   * @param {Object} currentScan - Current scan data
   * @param {Object} previousScan - Previous scan data
   * @param {Object} settings - Alert settings for the user
   * @returns {Array} - Array of detected alerts
   */
  static async detectChanges(currentScan, previousScan, settings = {}) {
    if (!previousScan) {
      console.log("No previous scan found - skipping change detection");
      return [];
    }

    const alerts = [];
    const thresholds = this.getThresholds(settings);

    // Compare scan data
    const currentPages = this.normalizeScanData(currentScan.scanData);
    const previousPages = this.normalizeScanData(previousScan.scanData);

    // Create URL maps for easier comparison
    const currentPageMap = new Map(currentPages.map((p) => [p.url, p]));
    const previousPageMap = new Map(previousPages.map((p) => [p.url, p]));

    // Detect removed pages (404s)
    for (const [url, prevPage] of previousPageMap) {
      if (!currentPageMap.has(url)) {
        if (this.isAlertEnabled("removed_page", settings)) {
          alerts.push({
            alertType: "removed_page",
            severity: "critical",
            pageUrl: url,
            changeDescription: "Page no longer exists or returned 404",
            oldValue: `Status: ${prevPage.status || 200}`,
            newValue: "Status: 404 or not found",
            metadata: { previousStatus: prevPage.status },
          });
        }
      }
    }

    // Detect new pages
    for (const [url, currPage] of currentPageMap) {
      if (!previousPageMap.has(url)) {
        if (this.isAlertEnabled("new_page", settings)) {
          alerts.push({
            alertType: "new_page",
            severity: "info",
            pageUrl: url,
            changeDescription: "New page discovered",
            oldValue: null,
            newValue: `Status: ${currPage.status || 200}`,
            metadata: { title: currPage.title },
          });
        }
      }
    }

    // Compare existing pages
    for (const [url, currPage] of currentPageMap) {
      const prevPage = previousPageMap.get(url);
      if (!prevPage) continue;

      // Detect title changes
      if (currPage.title !== prevPage.title) {
        if (this.isAlertEnabled("title_change", settings)) {
          alerts.push({
            alertType: "title_change",
            severity: "warning",
            pageUrl: url,
            changeDescription: "Page title was modified",
            oldValue: prevPage.title || "",
            newValue: currPage.title || "",
            metadata: {},
          });
        }
      }

      // Detect meta description changes
      if (currPage.metaDescription !== prevPage.metaDescription) {
        if (this.isAlertEnabled("meta_change", settings)) {
          alerts.push({
            alertType: "meta_change",
            severity: "warning",
            pageUrl: url,
            changeDescription: "Meta description was modified",
            oldValue: prevPage.metaDescription || "",
            newValue: currPage.metaDescription || "",
            metadata: {},
          });
        }
      }

      // Detect status code changes
      if (currPage.status !== prevPage.status) {
        if (this.isAlertEnabled("status_change", settings)) {
          const severity = this.getStatusChangeSeverity(
            prevPage.status,
            currPage.status
          );
          alerts.push({
            alertType: "status_change",
            severity,
            pageUrl: url,
            changeDescription: `HTTP status changed from ${prevPage.status} to ${currPage.status}`,
            oldValue: `${prevPage.status}`,
            newValue: `${currPage.status}`,
            metadata: {
              oldStatus: prevPage.status,
              newStatus: currPage.status,
            },
          });
        }
      }

      // Detect significant content changes
      const wordCountDiff = Math.abs(
        (currPage.wordCount || 0) - (prevPage.wordCount || 0)
      );
      const wordCountPercent =
        prevPage.wordCount > 0 ? (wordCountDiff / prevPage.wordCount) * 100 : 0;

      if (wordCountPercent > thresholds.contentChangePercent) {
        if (this.isAlertEnabled("content_change", settings)) {
          alerts.push({
            alertType: "content_change",
            severity: wordCountPercent > 50 ? "warning" : "info",
            pageUrl: url,
            changeDescription: `Significant content change detected (${wordCountPercent.toFixed(
              1
            )}% difference)`,
            oldValue: `${prevPage.wordCount || 0} words`,
            newValue: `${currPage.wordCount || 0} words`,
            metadata: {
              wordCountDiff,
              percentChange: wordCountPercent.toFixed(1),
              oldWordCount: prevPage.wordCount,
              newWordCount: currPage.wordCount,
            },
          });
        }
      }

      // Detect heading changes
      const headingChanges = this.compareHeadings(
        prevPage.headings,
        currPage.headings
      );
      if (
        headingChanges.changed &&
        this.isAlertEnabled("heading_change", settings)
      ) {
        alerts.push({
          alertType: "heading_change",
          severity: "info",
          pageUrl: url,
          changeDescription: `Heading structure modified (${headingChanges.changes} changes)`,
          oldValue: JSON.stringify(prevPage.headings || {}),
          newValue: JSON.stringify(currPage.headings || {}),
          metadata: headingChanges,
        });
      }

      // Detect broken links
      if (currPage.brokenLinks && currPage.brokenLinks.length > 0) {
        const newBrokenLinks = currPage.brokenLinks.filter(
          (link) => !prevPage.brokenLinks?.includes(link)
        );

        if (
          newBrokenLinks.length > 0 &&
          this.isAlertEnabled("broken_link", settings)
        ) {
          alerts.push({
            alertType: "broken_link",
            severity: "warning",
            pageUrl: url,
            changeDescription: `${newBrokenLinks.length} new broken link(s) detected`,
            oldValue: `${prevPage.brokenLinks?.length || 0} broken links`,
            newValue: `${currPage.brokenLinks.length} broken links`,
            metadata: {
              newBrokenLinks,
              totalBrokenLinks: currPage.brokenLinks.length,
            },
          });
        }
      }

      // Detect link changes
      const linkDiff = this.compareLinkCounts(prevPage, currPage);
      if (
        linkDiff.significant &&
        this.isAlertEnabled("link_change", settings)
      ) {
        alerts.push({
          alertType: "link_change",
          severity: "info",
          pageUrl: url,
          changeDescription: linkDiff.description,
          oldValue: `Internal: ${prevPage.internalLinks || 0}, External: ${
            prevPage.externalLinks || 0
          }`,
          newValue: `Internal: ${currPage.internalLinks || 0}, External: ${
            currPage.externalLinks || 0
          }`,
          metadata: linkDiff,
        });
      }

      // Detect page load time degradation
      if (currPage.loadTime && prevPage.loadTime) {
        const loadTimeIncrease = currPage.loadTime - prevPage.loadTime;
        if (
          loadTimeIncrease > thresholds.loadTimeIncrease &&
          this.isAlertEnabled("performance_degradation", settings)
        ) {
          alerts.push({
            alertType: "performance_degradation",
            severity: loadTimeIncrease > 5000 ? "warning" : "info",
            pageUrl: url,
            changeDescription: `Page load time increased by ${(
              loadTimeIncrease / 1000
            ).toFixed(2)}s`,
            oldValue: `${(prevPage.loadTime / 1000).toFixed(2)}s`,
            newValue: `${(currPage.loadTime / 1000).toFixed(2)}s`,
            metadata: {
              loadTimeIncrease,
              oldLoadTime: prevPage.loadTime,
              newLoadTime: currPage.loadTime,
            },
          });
        }
      }
    }

    return alerts;
  }

  /**
   * Normalize scan data to consistent format
   */
  static normalizeScanData(scanData) {
    if (!scanData) return [];

    // Handle different scan data formats
    if (Array.isArray(scanData)) {
      return scanData;
    }

    if (scanData.pages && Array.isArray(scanData.pages)) {
      return scanData.pages;
    }

    // If it's a single page scan
    if (scanData.url) {
      return [scanData];
    }

    return [];
  }

  /**
   * Check if alert type is enabled in settings
   */
  static isAlertEnabled(alertType, settings) {
    if (!settings || !settings.alertTypes) return true;

    const setting = settings.alertTypes.find((s) => s.alertType === alertType);
    return setting ? setting.isEnabled : true;
  }

  /**
   * Get threshold settings
   */
  static getThresholds(settings) {
    const defaults = {
      contentChangePercent: 10,
      loadTimeIncrease: 2000,
      linkChangePercent: 20,
    };

    if (!settings || !settings.thresholds) return defaults;

    return {
      ...defaults,
      ...settings.thresholds,
    };
  }

  /**
   * Determine severity of status code change
   */
  static getStatusChangeSeverity(oldStatus, newStatus) {
    // Going from 200 to error is critical
    if (oldStatus === 200 && (newStatus >= 400 || newStatus === 0)) {
      return "critical";
    }

    // Going to redirect
    if (newStatus >= 300 && newStatus < 400) {
      return "warning";
    }

    // Other changes
    return "info";
  }

  /**
   * Compare heading structures
   */
  static compareHeadings(oldHeadings, newHeadings) {
    if (!oldHeadings && !newHeadings) {
      return { changed: false, changes: 0 };
    }

    const old = oldHeadings || {};
    const new_ = newHeadings || {};

    let changes = 0;
    const details = {};

    ["h1", "h2", "h3", "h4", "h5", "h6"].forEach((tag) => {
      const oldCount = old[tag]?.length || 0;
      const newCount = new_[tag]?.length || 0;

      if (oldCount !== newCount) {
        changes++;
        details[tag] = { old: oldCount, new: newCount };
      }
    });

    return {
      changed: changes > 0,
      changes,
      details,
    };
  }

  /**
   * Compare link counts
   */
  static compareLinkCounts(oldPage, newPage) {
    const oldInternal = oldPage.internalLinks || 0;
    const newInternal = newPage.internalLinks || 0;
    const oldExternal = oldPage.externalLinks || 0;
    const newExternal = newPage.externalLinks || 0;

    const internalDiff = newInternal - oldInternal;
    const externalDiff = newExternal - oldExternal;

    const significant =
      Math.abs(internalDiff) > 5 || Math.abs(externalDiff) > 5;

    let description = "";
    if (internalDiff !== 0 && externalDiff !== 0) {
      description = `Internal links changed by ${internalDiff}, external links changed by ${externalDiff}`;
    } else if (internalDiff !== 0) {
      description = `Internal links changed by ${internalDiff}`;
    } else if (externalDiff !== 0) {
      description = `External links changed by ${externalDiff}`;
    }

    return {
      significant,
      description,
      internalDiff,
      externalDiff,
      oldInternal,
      newInternal,
      oldExternal,
      newExternal,
    };
  }

  /**
   * Create alerts in database
   */
  static async saveAlerts(alerts, userId, projectName, scanHistoryId) {
    if (!alerts || alerts.length === 0) return [];

    return new Promise((resolve, reject) => {
      const insertQuery = `
        INSERT INTO alerts (user_id, project_name, scan_history_id, alert_type, severity, page_url, change_description, old_value, new_value, metadata, is_read)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `;

      const createdAlerts = [];
      let completed = 0;

      alerts.forEach((alert) => {
        db.run(
          insertQuery,
          [
            userId,
            projectName,
            scanHistoryId,
            alert.alertType,
            alert.severity,
            alert.pageUrl,
            alert.changeDescription,
            alert.oldValue,
            alert.newValue,
            JSON.stringify(alert.metadata || {}),
          ],
          function (err) {
            if (err) {
              console.error("Error inserting alert:", err);
            } else {
              createdAlerts.push({ id: this.lastID, ...alert });
            }

            completed++;
            if (completed === alerts.length) {
              if (createdAlerts.length === 0 && alerts.length > 0) {
                reject(new Error("Failed to insert any alerts"));
              } else {
                resolve(createdAlerts);
              }
            }
          }
        );
      });
    });
  }
}

export default ChangeDetectionService;
