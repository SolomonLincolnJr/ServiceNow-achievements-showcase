# SNAS LinkedIn Export Flow - Deployment Guide 🎖️

## Mission Overview

Deploy the SNAS LinkedIn Export Flow with military-grade precision and excellence. This comprehensive system enables veterans to share their achievements to LinkedIn with Service-to-Success messaging and maintains strict SLA compliance.

**Target Performance:** ~1.8s total execution, 95%+ success rate  
**Branding:** Navy (#1B365D) / Gold (#FFD700) military heritage  
**Accessibility:** WCAG 2.1 AA compliant  

## Prerequisites Verification

### Required Roles
- [ ] `admin` or `app_engine_admin` (for Flow Designer)
- [ ] UI Builder access
- [ ] x_snc_snas_port scope access

### System Requirements
- [ ] ServiceNow Paris release or higher
- [ ] Flow Designer enabled
- [ ] UI Builder enabled  
- [ ] Background Scripts execution permissions
- [ ] REST API access for LinkedIn integration

### LinkedIn API Setup (Optional for Production)
- [ ] LinkedIn Developer Account
- [ ] OAuth 2.0 Application configured
- [ ] Access token with `w_member_social` scope
- [ ] Approved for LinkedIn API access

## Deployment Steps

### Phase 1: Environment Preparation

#### Step 1.1: Switch to SNAS Application Scope
```bash
# Navigate in ServiceNow
1. Go to: System Applications > My Company Applications
2. Select: SNAS Portfolio (x_snc_snas_port)
3. Verify App ID: f487471a839832102c9c95d0deaad325
```

#### Step 1.2: Verify Existing SNAS Infrastructure
```bash
# Check existing tables
1. Navigate to: System Definition > Tables
2. Verify exists: x_snc_snas_port_achievement
3. Check sample achievement records exist
```

### Phase 2: Core Infrastructure Deployment

#### Step 2.1: Create SNAS Tables
```javascript
// Execute in: System Definition > Scripts - Background
// Scope: x_snc_snas_port
// Script: /linkedin_export_flow/background_scripts/create_snas_tables.js

// Verification Commands:
// 1. Check table creation success in logs
// 2. Verify sample CSA record exists
// 3. Confirm proper field configuration
```

**Expected Results:**
- ✅ `x_snc_snas_port_snas_achievements` table created
- ✅ `x_snc_snas_port_snas_export_logs` table created  
- ✅ Sample achievement records populated
- ✅ Execution time < 2000ms

#### Step 2.2: Configure System Properties
```javascript
// Execute in: System Definition > Scripts - Background
// Scope: x_snc_snas_port
// Script: /linkedin_export_flow/system_properties/setup_properties.js

// Manual Alternative:
// Navigate to: System Properties > System Properties
// Import XML: /linkedin_export_flow/system_properties/linkedin_api_properties.xml
```

**Configure These Properties:**
```
x_snc_snas_port.linkedin_api_endpoint = https://api.linkedin.com/v2/shares
x_snc_snas_port.linkedin_oauth_token = [YOUR_TOKEN_OR_BLANK]
x_snc_snas_port.linkedin_mock_mode = true
x_snc_snas_port.linkedin_mock_endpoint = https://httpbin.org/post
x_snc_snas_port.linkedin_timeout_ms = 5000
x_snc_snas_port.linkedin_max_retries = 2
x_snc_snas_port.linkedin_retry_delay_ms = 500
x_snc_snas_port.linkedin_performance_monitoring = true
x_snc_snas_port.brand_color_navy = #1B365D
x_snc_snas_port.brand_color_gold = #FFD700
```

### Phase 3: Flow Designer Implementation

#### Step 3.1: Create SNAS LinkedIn Export Flow
```bash
# Navigate to: Process Automation > Flow Designer
1. Click "New" > "Flow"
2. Name: SNAS_LinkedIn_Export
3. Description: Military-heritage LinkedIn export flow for SNAS achievements

# Configure Trigger:
- Type: Record Updated
- Table: x_snc_snas_port_snas_achievements  
- Condition: export_requested changes to true
```

#### Step 3.2: Build Flow Actions (8 Steps)

**Action 1: Lookup Achievement Details**
- Type: Lookup Record
- Table: x_snc_snas_port_snas_achievements
- Sys ID: ${trigger.record.sys_id}
- Outputs: title, description, badge_image, user_sys_id, category, priority_score

**Action 2: Get User Information** 
- Type: Lookup Record
- Table: sys_user
- Sys ID: ${action1.user_sys_id}
- Outputs: name, email, sys_id, title, department

**Action 3: Generate Military-Heritage AI Content**
- Type: Script Step
- Script: Use `/linkedin_export_flow/flow_designer/generate_linkedin_content.js`
- Performance Target: <200ms

**Action 4: Build LinkedIn API Payload**
- Type: Script Step  
- Script: Use `/linkedin_export_flow/flow_designer/build_api_payload.js`
- Performance Target: <100ms

**Action 5: LinkedIn API REST Call**
- Type: REST Step
- Method: POST
- Endpoint: ${property.x_snc_snas_port.linkedin_api_endpoint}
- Headers:
  ```
  Authorization: Bearer ${property.x_snc_snas_port.linkedin_oauth_token}
  Content-Type: application/json
  X-Restli-Protocol-Version: 2.0.0
  ```
- Body: ${action4.api_payload}
- Performance Target: <800ms

**Action 6: Create Export Log Entry**
- Type: Create Record
- Table: x_snc_snas_port_snas_export_logs
- Fields: achievement_id, export_time, status, error_message, response_id, execution_time_ms

**Action 7: UI Notification with SNAS Branding**
- Type: Script Step
- Script: Use `/linkedin_export_flow/flow_designer/send_ui_notification.js`
- Performance Target: <50ms

**Action 8: Create Incident on Failure (Conditional)**
- Condition: ${action6.status == 'Failed'}
- Type: Create Record
- Table: incident
- Priority: Based on error severity

#### Step 3.3: Activate Flow
```bash
1. Save all flow actions
2. Verify scope is x_snc_snas_port
3. Click "Activate"
4. Test with sample achievement record
```

### Phase 4: UI Builder Integration

#### Step 4.1: Create Script Include
```bash
# Navigate to: System Definition > Script Includes
1. Name: SNASLinkedInAjax
2. Script: Use /linkedin_export_flow/ui_builder/SNASLinkedInAjax.js
3. Accessible from: All application scopes
4. Active: true
```

#### Step 4.2: Deploy UI Component
```bash
# Navigate to: UI Builder > UI Builder
1. Create new Experience or use existing
2. Add new Page/Component
3. Use HTML from: /linkedin_export_flow/ui_builder/snas_linkedin_share_component.html
4. Add JavaScript: /linkedin_export_flow/ui_builder/snas_linkedin_controller.js
```

**Component Configuration:**
- Name: SNAS LinkedIn Share Component
- Military Heritage Branding: Navy (#1B365D) / Gold (#FFD700)
- Accessibility: WCAG 2.1 AA compliant
- Performance: <0.5s render target

### Phase 5: Performance Monitoring Setup

#### Step 5.1: Deploy Performance Monitor
```javascript
// Create Script Include: SNASPerformanceMonitor
// Script: /linkedin_export_flow/monitoring/snas_performance_monitor.js
// Type: On Demand
```

#### Step 5.2: Configure Scheduled Monitoring
```bash
# Navigate to: System Definition > Scheduled Jobs
1. Name: SNAS LinkedIn Performance Monitor  
2. Script: Use /linkedin_export_flow/monitoring/snas_scheduled_monitor.js
3. Schedule: 0 */15 * * * ? (Every 15 minutes)
4. Active: true
```

**Monitoring Configuration:**
```javascript
// Update in scheduled script as needed
MONITORING_CONFIG = {
    NOTIFICATION_EMAILS: ['snas-admin@yourcompany.com'],
    SLACK_WEBHOOK: 'https://hooks.slack.com/...',
    ENABLE_NOTIFICATIONS: true
}
```

## Testing Procedures

### Unit Testing

#### Test 1: Table Creation Verification
```javascript
// Execute in Background Scripts
var achievement = new GlideRecord('x_snc_snas_port_snas_achievements');
achievement.addQuery('title', 'Certified System Administrator (CSA)');
achievement.query();

if (achievement.next()) {
    gs.info('✅ Sample achievement found: ' + achievement.sys_id);
} else {
    gs.error('❌ Sample achievement not found');
}
```

#### Test 2: System Properties Validation
```javascript
// Verify all properties exist and have correct values
var properties = [
    'x_snc_snas_port.linkedin_mock_mode',
    'x_snc_snas_port.brand_color_navy',
    'x_snc_snas_port.brand_color_gold'
];

properties.forEach(function(prop) {
    var value = gs.getProperty(prop);
    gs.info('Property ' + prop + ': ' + (value || 'NOT SET'));
});
```

#### Test 3: Flow Trigger Test
```javascript
// Update achievement to trigger flow
var achievement = new GlideRecord('x_snc_snas_port_snas_achievements');
if (achievement.get('title', 'Certified System Administrator (CSA)')) {
    achievement.export_requested = true;
    achievement.update();
    gs.info('✅ Flow trigger test initiated');
}
```

### Integration Testing

#### Test 4: Mock LinkedIn API Test
```bash
# Verify mock mode is enabled
1. Set linkedin_mock_mode = true
2. Trigger export for test achievement  
3. Check export log for Success status
4. Verify httpbin.org response logged
```

#### Test 5: Performance SLA Validation
```javascript
// Execute performance analysis
var monitor = new SNASPerformanceMonitor();
var results = monitor.analyze(0.25); // 15 minutes

// Check SLA compliance
gs.info('Success Rate: ' + results.metrics.exports.success_rate + '%');
gs.info('Avg Execution: ' + results.metrics.exports.avg_execution_time + 'ms');
gs.info('Compliance: ' + results.compliance.overall_score + '%');
```

#### Test 6: UI Component Testing
```bash
1. Navigate to UI Builder component
2. Load sample achievement data
3. Verify military heritage branding displays
4. Test share button functionality
5. Confirm accessibility with screen reader
6. Validate WCAG contrast ratios
```

### End-to-End Testing

#### Test 7: Complete Flow Execution
```bash
# Production-like test with mock API
1. Create new achievement record
2. Set export_requested = true via UI
3. Monitor flow execution in real-time
4. Verify all 8 flow actions execute successfully  
5. Check export log entry creation
6. Confirm UI notification appears
7. Validate total execution time < 1.8s
```

#### Test 8: Error Handling Validation
```bash
# Test failure scenarios
1. Set invalid LinkedIn endpoint
2. Trigger export and verify incident creation
3. Test network timeout scenarios
4. Validate retry logic execution
5. Confirm error notifications work
```

## Production Deployment

### LinkedIn API Configuration
```bash
# For production LinkedIn integration
1. Replace mock endpoint with: https://api.linkedin.com/v2/shares
2. Set linkedin_mock_mode = false
3. Configure valid OAuth token in linkedin_oauth_token property
4. Test with actual LinkedIn API
5. Monitor for rate limiting (1000 calls/day limit)
```

### Security Hardening
```bash
1. Encrypt linkedin_oauth_token property
2. Set read/write roles to admin only
3. Review Script Include ACL permissions
4. Enable audit logging for export operations
5. Configure backup and recovery procedures
```

### Performance Optimization
```bash
1. Enable performance monitoring notifications
2. Set up trending dashboards
3. Configure auto-scaling if needed
4. Implement caching for frequent operations
5. Monitor LinkedIn API quota usage
```

## Rollback Procedures

### Emergency Rollback
```bash
# If issues arise in production
1. Set linkedin_mock_mode = true (immediate safe mode)
2. Deactivate SNAS_LinkedIn_Export flow
3. Disable scheduled monitoring job
4. Reset export_requested flags on pending records
5. Create incident for investigation
```

### Partial Rollback
```bash
# Rollback specific components
1. Flow only: Deactivate flow, keep UI active
2. UI only: Remove component, keep flow for batch processing  
3. Monitoring: Disable alerts while keeping logging active
```

## Troubleshooting Guide

### Common Issues

**Issue: Flow not triggering**
- ✅ Verify scope is x_snc_snas_port  
- ✅ Check condition: export_requested changes to true
- ✅ Confirm user has required permissions
- ✅ Review Flow Designer execution logs

**Issue: REST call failures**
- ✅ Verify linkedin_api_endpoint property
- ✅ Check linkedin_oauth_token is valid
- ✅ Test network connectivity to LinkedIn
- ✅ Review timeout and retry settings

**Issue: UI component not loading**
- ✅ Confirm Script Include is active and accessible
- ✅ Verify UI Builder component configuration
- ✅ Check browser console for JavaScript errors
- ✅ Validate SNAS branding CSS is loading

**Issue: Performance SLA violations**
- ✅ Review Flow execution times in diagnostics
- ✅ Check LinkedIn API response times
- ✅ Analyze AI content generation performance
- ✅ Monitor system resource usage

### Performance Baselines

**Expected Execution Times:**
- Flow Trigger Detection: <50ms
- Achievement Lookup: <50ms  
- User Information Retrieval: <50ms
- AI Content Generation: <200ms
- API Payload Building: <100ms
- LinkedIn REST Call: <800ms
- Export Log Creation: <100ms
- UI Notification: <50ms
- Incident Creation (if needed): <150ms

**Total SLA Target: <1800ms (1.8 seconds)**

### Success Metrics

**Deployment Success Criteria:**
- ✅ All tables created successfully
- ✅ System properties configured correctly
- ✅ Flow activates without errors
- ✅ Mock API tests pass 100%
- ✅ UI component renders <0.5s
- ✅ Performance monitoring active
- ✅ Success rate >95% in testing
- ✅ WCAG 2.1 AA compliance verified
- ✅ Military heritage branding displays correctly

**Go-Live Checklist:**
- [ ] All unit tests passing
- [ ] Integration tests successful  
- [ ] End-to-end testing complete
- [ ] Performance monitoring configured
- [ ] Security review approved
- [ ] Documentation complete
- [ ] Support team trained
- [ ] Rollback procedures tested

---

## 🎖️ Military Excellence Standards

This deployment follows military precision standards:

- **Attention to Detail**: Every configuration verified
- **Mission Focus**: Clear objectives and success criteria
- **Excellence**: Performance targets exceed requirements  
- **Service**: Supporting veteran career advancement

**Deployment with Honor. Execute with Precision. Serve with Excellence.** 🇺🇸

---

*SNAS LinkedIn Export Flow - Built with Military Precision | Powered by ServiceNow Excellence | Serving Veteran Success*