# Change Detection Alerts System

## Overview

A comprehensive change detection system that compares website scans over time and alerts users when important SEO-related changes are detected. The system monitors content, technical issues, and site structure changes.

## ✨ Features

### 1. **Automated Change Detection**

- Compares current scans with previous scans
- Detects 10+ types of SEO-critical changes
- Customizable sensitivity thresholds
- Real-time alert generation

### 2. **Multi-Channel Notifications**

- **In-App**: Notification bell with badge count
- **Email**: HTML-formatted alert summaries
- **Webhook**: Integration with Slack, Discord, Zapier, etc.

### 3. **Flexible Alert Configuration**

- Enable/disable specific alert types
- Set alert frequency (immediate, daily, weekly)
- Configure custom thresholds
- Project-specific or global settings

### 4. **Comprehensive Dashboard**

- View all alerts with filtering and search
- Severity-based organization (critical, warning, info)
- Before/after diff view
- Alert statistics and trends

## 🚀 Quick Start

### 1. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install nodemailer
```

#### Configure Environment Variables

Add to `.env`:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@seoanalyzer.com

# Application URL
APP_URL=http://localhost:3000
```

#### Database Models

The system uses Sequelize ORM with three main models:

- `ScanHistory` - Stores historical scan data
- `Alert` - Stores detected changes
- `AlertSettings` - User notification preferences

Models are automatically created when the server starts.

### 2. Frontend Setup

#### Add Routes

Add to your `App.tsx` or routing file:

```tsx
import AlertSettings from './pages/AlertSettings';
import AlertsDashboard from './pages/AlertsDashboard';
import NotificationBell from './components/NotificationBell';

// In your routes:
<Route path="/alert-settings" element={<AlertSettings />} />
<Route path="/alerts" element={<AlertsDashboard />} />

// In your navigation:
<NotificationBell />
```

## 📊 Alert Types

### Content Changes

| Type             | Description                 | Default Threshold |
| ---------------- | --------------------------- | ----------------- |
| `title_change`   | Page title modified         | Immediate         |
| `meta_change`    | Meta description changed    | Immediate         |
| `content_change` | Significant content updates | >10% word count   |
| `heading_change` | H1-H6 structure altered     | Immediate         |

### Technical Issues

| Type                      | Description               | Default Threshold |
| ------------------------- | ------------------------- | ----------------- |
| `status_change`           | HTTP status code changed  | Immediate         |
| `broken_link`             | New broken links detected | Immediate         |
| `performance_degradation` | Page load time increased  | >2 seconds        |

### Site Structure

| Type           | Description                      | Default Threshold |
| -------------- | -------------------------------- | ----------------- |
| `new_page`     | New page discovered              | Daily digest      |
| `removed_page` | Page returns 404                 | Immediate         |
| `link_change`  | Internal/external links modified | >5 links          |

## 🔧 API Endpoints

### Alerts Management

#### Get All Alerts

```http
GET /api/alerts?userId={userId}&severity={severity}&alertType={type}&isRead={boolean}&limit={number}
```

#### Get Alert by ID

```http
GET /api/alerts/:id?userId={userId}
```

#### Mark as Read

```http
PATCH /api/alerts/:id/read
Body: { "userId": "user-id" }
```

#### Mark All as Read

```http
POST /api/alerts/mark-all-read
Body: { "userId": "user-id", "projectName": "optional" }
```

#### Delete Alert

```http
DELETE /api/alerts/:id?userId={userId}
```

#### Get Unread Count

```http
GET /api/alerts/unread-count?userId={userId}&projectName={optional}
```

#### Get Alert Statistics

```http
GET /api/alerts/stats?userId={userId}&projectName={optional}&days={30}
```

### Alert Settings

#### Get Settings

```http
GET /api/alerts/settings?userId={userId}&projectName={optional}
```

#### Update Settings

```http
POST /api/alerts/settings
Body: {
  "userId": "user-id",
  "settings": [
    {
      "projectName": "example.com",
      "alertType": "title_change",
      "isEnabled": true,
      "notificationChannel": "email",
      "frequency": "immediate",
      "webhookUrl": "https://hooks.slack.com/...",
      "thresholdSettings": {
        "contentChangePercent": 10,
        "loadTimeIncrease": 2000
      }
    }
  ]
}
```

## 💡 Usage Examples

### Configure Alert Settings

Navigate to `/alert-settings` to:

1. Enable/disable specific alert types
2. Choose notification channels (in-app, email, webhook)
3. Set alert frequency
4. Configure custom thresholds
5. Set project-specific or global settings

### View Alerts Dashboard

Navigate to `/alerts` to:

1. See all alerts with statistics
2. Filter by type, severity, or status
3. Search alerts by URL or description
4. View before/after changes in diff format
5. Mark alerts as read or delete them

### In-App Notifications

The notification bell icon in your navigation shows:

- Real-time unread count badge
- Dropdown with recent unread alerts
- Quick mark-as-read functionality
- Link to full alerts dashboard

## 🎨 UI Components

### AlertSettings Component

- **Location**: `frontand/src/pages/AlertSettings.tsx`
- **Purpose**: Configure alert preferences
- **Features**:
  - Grouped alert types by category
  - Toggle switches for enable/disable
  - Channel selection (in-app, email, webhook)
  - Frequency options (immediate, daily, weekly)
  - Custom threshold inputs
  - Project-specific settings

### AlertsDashboard Component

- **Location**: `frontand/src/pages/AlertsDashboard.tsx`
- **Purpose**: View and manage all alerts
- **Features**:
  - Statistics cards (total, unread, critical, warnings)
  - Multi-filter system (search, type, severity, status)
  - Alert list with severity indicators
  - Modal with detailed change diff
  - Mark as read and delete actions

### NotificationBell Component

- **Location**: `frontand/src/components/NotificationBell.tsx`
- **Purpose**: In-app notification dropdown
- **Features**:
  - Animated badge with unread count
  - Auto-refresh every 30 seconds
  - Recent alerts dropdown
  - Quick mark-as-read
  - Link to alerts dashboard

## 🔔 Notification System

### Email Notifications

- Beautiful HTML email template
- Summary statistics (critical, warnings, info)
- Grouped by severity
- Before/after change display
- Direct link to detailed report

### Webhook Integration

Supports integration with:

- **Slack**: Post to channels
- **Discord**: Send to webhooks
- **Microsoft Teams**: Notify teams
- **Zapier**: Trigger automations
- **Custom**: Any webhook-compatible service

### Webhook Payload Example

```json
{
  "timestamp": "2025-11-11T10:30:00Z",
  "alertCount": 3,
  "alerts": [
    {
      "type": "title_change",
      "severity": "warning",
      "pageUrl": "https://example.com/page",
      "description": "Page title was modified",
      "oldValue": "Old Title",
      "newValue": "New Title",
      "metadata": {}
    }
  ]
}
```

## 🔄 Scan Integration

The change detection system is automatically triggered after each scan:

1. **Scan Completes** → Scan data saved to `ScanHistory`
2. **Get Previous Scan** → Compare with last scan for same URL
3. **Detect Changes** → Run change detection algorithms
4. **Generate Alerts** → Create alert records in database
5. **Send Notifications** → Deliver via configured channels

### How It Works

```javascript
// In scanController.js - after scan completes
await saveScanHistory(userId, url, scanReport);

// saveScanHistory function:
1. Save current scan to ScanHistory table
2. Fetch previous scan for comparison
3. Get user's alert settings
4. Run ChangeDetectionService.detectChanges()
5. Save detected alerts to database
6. Send notifications via alertNotificationService
```

## 📈 Performance Considerations

### Database Optimization

- Indexes on frequently queried fields (userId, projectName, createdAt)
- Automatic cleanup of old scan history (keeps last 30 scans)
- Efficient change detection algorithms

### Notification Throttling

- Frequency settings prevent notification spam
- Daily/weekly digests group multiple alerts
- Configurable thresholds reduce false positives

### Frontend Optimization

- Lazy loading of alert details
- Pagination for large alert lists
- Efficient state management
- Auto-refresh with rate limiting

## 🛠️ Customization

### Adding New Alert Types

1. **Add to Change Detection Service**:

```javascript
// In changeDetectionService.js
if (condition) {
  alerts.push({
    alertType: "custom_alert",
    severity: "warning",
    pageUrl: url,
    changeDescription: "Custom change detected",
    oldValue: "old",
    newValue: "new",
    metadata: { customData: true },
  });
}
```

2. **Add to Frontend**:

```typescript
// In AlertSettings.tsx
{
  type: 'custom_alert',
  label: 'Custom Alert',
  description: 'Description of custom alert',
  icon: '🎯',
  category: 'Custom Category'
}
```

### Custom Thresholds

Add to `thresholdSettings` in AlertSettings model:

```javascript
thresholdSettings: {
  contentChangePercent: 10,
  loadTimeIncrease: 2000,
  customThreshold: 100  // Add your custom threshold
}
```

## 📝 Database Schema

### ScanHistory Table

```sql
- id: INTEGER (Primary Key)
- userId: STRING (Indexed)
- projectName: STRING (Indexed)
- url: STRING
- scanDate: DATE
- pagesScanned: INTEGER
- seoScore: INTEGER
- metrics: JSON
- recommendations: JSON
- scanData: JSON (detailed page data)
- metadata: JSON
```

### Alert Table

```sql
- id: INTEGER (Primary Key)
- userId: STRING (Indexed)
- projectName: STRING (Indexed)
- alertType: STRING (Indexed)
- severity: ENUM('critical', 'warning', 'info')
- pageUrl: STRING
- changeDescription: TEXT
- oldValue: TEXT
- newValue: TEXT
- isRead: BOOLEAN (Default: false)
- scanHistoryId: INTEGER (Foreign Key)
- metadata: JSON
- createdAt: TIMESTAMP
```

### AlertSettings Table

```sql
- id: INTEGER (Primary Key)
- userId: STRING (Indexed)
- projectName: STRING (Nullable, Indexed)
- alertType: STRING
- isEnabled: BOOLEAN (Default: true)
- notificationChannel: ENUM('email', 'in_app', 'webhook')
- webhookUrl: STRING (Nullable)
- frequency: ENUM('immediate', 'daily', 'weekly')
- thresholdSettings: JSON
- createdAt: TIMESTAMP
```

## 🐛 Troubleshooting

### Alerts Not Generating

1. Check if ScanHistory model is properly initialized
2. Verify user has previous scans for comparison
3. Check alert settings are enabled
4. Review server logs for errors in change detection

### Email Notifications Not Sending

1. Verify SMTP credentials in `.env`
2. Check firewall/security settings
3. Enable "Less secure app access" for Gmail
4. Use app-specific password for Gmail

### Webhook Failures

1. Verify webhook URL is accessible
2. Check webhook endpoint accepts POST requests
3. Review webhook payload format
4. Check for SSL certificate issues

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Sequelize ORM Guide](https://sequelize.org/)
- [React Hooks Best Practices](https://react.dev/reference/react)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## 🤝 Contributing

To add new features:

1. Add backend logic to `changeDetectionService.js`
2. Create API endpoints in `alertController.js`
3. Add routes in `routes/alerts.js`
4. Update frontend components
5. Test thoroughly
6. Update documentation

## 📄 License

This feature is part of the SEO Analyzer project.

---

**Built with ❤️ for better SEO monitoring**
