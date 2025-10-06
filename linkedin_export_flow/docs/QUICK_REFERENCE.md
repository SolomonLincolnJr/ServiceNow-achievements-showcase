# SNAS LinkedIn Export Flow - Quick Reference 🎖️

## Deployment Checklist

### ✅ Phase 1: Setup (15 mins)
```bash
☐ Switch to x_snc_snas_port scope
☐ Execute create_snas_tables.js in Background Scripts
☐ Execute setup_properties.js in Background Scripts  
☐ Verify mock_mode = true for testing
```

### ✅ Phase 2: Flow Designer (20 mins)
```bash
☐ Create new Flow: SNAS_LinkedIn_Export
☐ Set trigger: Record Updated on snas_achievements
☐ Add 8 flow actions (see deployment guide)
☐ Activate flow
☐ Test with sample achievement
```

### ✅ Phase 3: UI Integration (15 mins)  
```bash
☐ Create Script Include: SNASLinkedInAjax
☐ Deploy UI Builder component
☐ Test component rendering (<0.5s)
☐ Verify SNAS branding (Navy/Gold)
```

### ✅ Phase 4: Monitoring (10 mins)
```bash
☐ Deploy performance monitor script include
☐ Create scheduled job (every 15 minutes)
☐ Configure notification emails
☐ Test monitoring execution
```

## Key Commands

### Testing Commands
```javascript
// Quick test trigger
var achievement = new GlideRecord('x_snc_snas_port_snas_achievements');
achievement.get('title', 'Certified System Administrator (CSA)');
achievement.export_requested = true;
achievement.update();

// Performance check  
var monitor = new SNASPerformanceMonitor();
var results = monitor.analyze(0.25); // 15 minutes
gs.info('Success Rate: ' + results.metrics.exports.success_rate + '%');

// Run comprehensive tests
// Execute: /linkedin_export_flow/tests/snas_comprehensive_test.js
```

### Troubleshooting Commands
```javascript
// Check system properties
var props = ['linkedin_mock_mode', 'brand_color_navy', 'brand_color_gold'];
props.forEach(p => gs.info(p + ': ' + gs.getProperty('x_snc_snas_port.' + p)));

// Verify tables exist
['snas_achievements', 'snas_export_logs'].forEach(t => {
    gs.info(t + ': ' + new GlideRecord('x_snc_snas_port_' + t).isValid());
});

// Reset stuck exports
var stuck = new GlideRecord('x_snc_snas_port_snas_achievements');
stuck.addQuery('export_requested', true);
stuck.query();
while (stuck.next()) {
    stuck.export_requested = false;
    stuck.update();
}
```

## Performance Targets

| Metric | Target | Critical Threshold |
|--------|--------|--------------------|
| Total Flow | <1.8s | >2.7s |
| Success Rate | >95% | <85% |
| AI Content | <200ms | >500ms |
| REST Call | <800ms | >1.5s |
| UI Render | <500ms | >1s |

## Emergency Procedures

### 🚨 Enable Safe Mode
```javascript
// Immediate safe mode activation
gs.setProperty('x_snc_snas_port.linkedin_mock_mode', 'true');
gs.info('🔒 SNAS LinkedIn Export in SAFE MODE');
```

### 🚨 Flow Deactivation
```bash
1. Go to Process Automation > Flow Designer
2. Find SNAS_LinkedIn_Export 
3. Click "Deactivate"
4. Reset export_requested flags if needed
```

### 🚨 Rollback Sequence
```bash
1. Enable mock mode (immediate)
2. Deactivate flow (2 minutes)
3. Disable monitoring (1 minute)  
4. Create incident for investigation
5. Notify SNAS support team
```

## Configuration Values

### System Properties
```bash
linkedin_api_endpoint = https://api.linkedin.com/v2/shares
linkedin_mock_mode = true (testing) / false (production)
linkedin_mock_endpoint = https://httpbin.org/post
linkedin_timeout_ms = 5000
linkedin_max_retries = 2
linkedin_retry_delay_ms = 500
linkedin_performance_monitoring = true
brand_color_navy = #1B365D
brand_color_gold = #FFD700
```

### Flow Actions Summary
```bash
1. Lookup Achievement Details (50ms)
2. Get User Information (50ms)
3. Generate Military AI Content (200ms)
4. Build LinkedIn API Payload (100ms)
5. LinkedIn API REST Call (800ms)
6. Create Export Log Entry (100ms)
7. UI Notification with Branding (50ms)
8. Create Incident on Failure (150ms)
```

## Success Validation

### ✅ Deployment Success
```bash
☐ All tests pass >95%
☐ Sample export completes <1.8s
☐ UI renders with Navy/Gold branding
☐ Export logs created successfully
☐ Performance monitoring active
☐ Mock mode working correctly
```

### ✅ Production Readiness  
```bash
☐ LinkedIn OAuth token configured
☐ Mock mode disabled
☐ Success rate >95% over 24hrs
☐ Performance SLA met consistently
☐ Error handling tested and working
☐ Monitoring alerts configured
```

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Flow not triggering | Scope/condition | Verify x_snc_snas_port scope, check condition |
| REST call fails | Token/endpoint | Check OAuth token, verify endpoint URL |
| UI not loading | Script Include | Verify SNASLinkedInAjax is active and accessible |
| Performance slow | Configuration | Review timeout settings, check system resources |
| Colors wrong | Properties | Verify brand colors: Navy #1B365D, Gold #FFD700 |

## Contact Information

**SNAS Support Team**: snas-support@company.com  
**Emergency Escalation**: Call ServiceNow Administrator  
**Documentation**: /linkedin_export_flow/docs/  
**Monitoring Dashboard**: ServiceNow > SNAS > LinkedIn Performance  

---

## 🎖️ Military Excellence Standards

- **Precision**: Every configuration verified before activation
- **Discipline**: Follow deployment checklist completely  
- **Excellence**: Performance targets exceed requirements
- **Service**: Supporting veteran career advancement

**Deploy with Honor. Execute with Precision. Serve with Excellence.** 🇺🇸