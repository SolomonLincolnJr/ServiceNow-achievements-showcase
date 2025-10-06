/**
 * SNAS LinkedIn Export Flow - Scheduled Performance Monitor
 * 
 * Automated monitoring job to run performance analysis on schedule
 * Recommended schedule: Every 15 minutes for real-time monitoring
 * 
 * Setup Instructions:
 * 1. Go to System Definition > Scheduled Jobs
 * 2. Create new job with name: SNAS LinkedIn Performance Monitor
 * 3. Set script to this content
 * 4. Configure schedule (e.g., "0 */15 * * * ?" for every 15 minutes)
 * 5. Set scope to x_snc_snas_port
 */

(function executeScheduledMonitoring() {
    'use strict';
    
    var MONITORING_CONFIG = {
        // Time windows to analyze (in hours)
        REAL_TIME_WINDOW: 0.25,    // 15 minutes
        SHORT_TERM_WINDOW: 1,      // 1 hour  
        DAILY_WINDOW: 24,          // 24 hours
        
        // Alert thresholds
        CRITICAL_SUCCESS_RATE: 85,  // Below 85% triggers critical alert
        WARNING_SUCCESS_RATE: 92,   // Below 92% triggers warning
        CRITICAL_AVG_TIME: 2700,    // Above 2.7s triggers critical (150% of SLA)
        WARNING_AVG_TIME: 2160,     // Above 2.16s triggers warning (120% of SLA)
        
        // Notification settings
        ENABLE_NOTIFICATIONS: true,
        NOTIFICATION_EMAILS: ['snas-admin@company.com'], // Configure as needed
        SLACK_WEBHOOK: '', // Configure if using Slack notifications
        
        // Data retention
        KEEP_MONITORING_DATA_DAYS: 30
    };
    
    try {
        gs.info('🎖️ SNAS Scheduled Performance Monitor Starting...');
        var startTime = new Date().getTime();
        
        // Load the performance monitor module
        var monitor = loadPerformanceMonitor();
        if (!monitor) {
            throw new Error('Performance monitor module could not be loaded');
        }
        
        // Perform multi-window analysis
        var analysisResults = performMultiWindowAnalysis(monitor);
        
        // Process alerts and notifications
        processAlertsAndNotifications(analysisResults);
        
        // Clean up old monitoring data
        cleanupOldMonitoringData();
        
        // Store results for trending
        storeMonitoringResults(analysisResults);
        
        var totalExecutionTime = new Date().getTime() - startTime;
        
        gs.info('✅ SNAS Scheduled Monitoring Complete (' + totalExecutionTime + 'ms)');
        gs.info('📊 Analysis Summary:');
        
        // Log summary of each window
        for (var window in analysisResults) {
            var result = analysisResults[window];
            gs.info('  ' + window + ': ' + result.metrics.exports.total_exports + ' exports, ' + 
                   result.metrics.exports.success_rate.toFixed(1) + '% success, ' +
                   result.compliance.overall_score.toFixed(1) + '% compliance');
        }
        
    } catch (error) {
        gs.error('❌ SNAS Scheduled Monitor Error: ' + error.toString());
        
        // Create incident for monitoring system failure
        createMonitoringSystemIncident(error);
    }
    
    /**
     * Load the performance monitor module
     * @returns {Object} Performance monitor instance
     */
    function loadPerformanceMonitor() {
        try {
            // Include the performance monitor script
            // Note: In ServiceNow, you might need to use GlideScriptInclude or similar
            
            // For now, we'll implement a simplified version inline
            return createInlineMonitor();
            
        } catch (error) {
            gs.error('Error loading performance monitor: ' + error.toString());
            return null;
        }
    }
    
    /**
     * Perform analysis across multiple time windows
     * @param {Object} monitor - Performance monitor instance
     * @returns {Object} Analysis results for each window
     */
    function performMultiWindowAnalysis(monitor) {
        var results = {};
        
        try {
            // Real-time window (15 minutes)
            gs.info('Analyzing real-time window (15 minutes)...');
            results.realtime = monitor.analyze(MONITORING_CONFIG.REAL_TIME_WINDOW);
            
            // Short-term window (1 hour) 
            gs.info('Analyzing short-term window (1 hour)...');
            results.shortterm = monitor.analyze(MONITORING_CONFIG.SHORT_TERM_WINDOW);
            
            // Only run daily analysis during specific hours to avoid performance impact
            var currentHour = new Date().getHours();
            if (currentHour === 6 || currentHour === 18) { // 6 AM and 6 PM
                gs.info('Analyzing daily window (24 hours)...');
                results.daily = monitor.analyze(MONITORING_CONFIG.DAILY_WINDOW);
            }
            
        } catch (error) {
            gs.error('Multi-window analysis error: ' + error.toString());
        }
        
        return results;
    }
    
    /**
     * Process alerts and send notifications based on analysis results
     * @param {Object} analysisResults - Results from multi-window analysis
     */
    function processAlertsAndNotifications(analysisResults) {
        try {
            if (!MONITORING_CONFIG.ENABLE_NOTIFICATIONS) {
                return;
            }
            
            var alerts = [];
            
            // Check each analysis window for alert conditions
            for (var window in analysisResults) {
                var result = analysisResults[window];
                var windowAlerts = checkAlertConditions(result, window);
                alerts = alerts.concat(windowAlerts);
            }
            
            // Send notifications if alerts exist
            if (alerts.length > 0) {
                sendAlertNotifications(alerts);
            }
            
            // Update alert status in system
            updateAlertStatus(alerts);
            
        } catch (error) {
            gs.error('Alert processing error: ' + error.toString());
        }
    }
    
    /**
     * Check for alert conditions in analysis results
     * @param {Object} result - Analysis result for a time window
     * @param {string} window - Time window name
     * @returns {Array} Array of alert objects
     */
    function checkAlertConditions(result, window) {
        var alerts = [];
        
        try {
            var metrics = result.metrics.exports;
            
            // Critical success rate alert
            if (metrics.success_rate < MONITORING_CONFIG.CRITICAL_SUCCESS_RATE) {
                alerts.push({
                    level: 'CRITICAL',
                    type: 'Success Rate',
                    window: window,
                    message: 'LinkedIn export success rate critically low: ' + metrics.success_rate.toFixed(1) + '%',
                    threshold: MONITORING_CONFIG.CRITICAL_SUCCESS_RATE + '%',
                    actual: metrics.success_rate.toFixed(1) + '%',
                    impact: 'User experience severely affected'
                });
            } else if (metrics.success_rate < MONITORING_CONFIG.WARNING_SUCCESS_RATE) {
                alerts.push({
                    level: 'WARNING',
                    type: 'Success Rate',
                    window: window,
                    message: 'LinkedIn export success rate below optimal: ' + metrics.success_rate.toFixed(1) + '%',
                    threshold: MONITORING_CONFIG.WARNING_SUCCESS_RATE + '%',
                    actual: metrics.success_rate.toFixed(1) + '%',
                    impact: 'User experience degraded'
                });
            }
            
            // Performance alert
            if (metrics.avg_execution_time > MONITORING_CONFIG.CRITICAL_AVG_TIME) {
                alerts.push({
                    level: 'CRITICAL',
                    type: 'Performance',
                    window: window,
                    message: 'LinkedIn export performance critically degraded: ' + metrics.avg_execution_time.toFixed(0) + 'ms',
                    threshold: MONITORING_CONFIG.CRITICAL_AVG_TIME + 'ms',
                    actual: metrics.avg_execution_time.toFixed(0) + 'ms',
                    impact: 'SLA compliance at risk'
                });
            } else if (metrics.avg_execution_time > MONITORING_CONFIG.WARNING_AVG_TIME) {
                alerts.push({
                    level: 'WARNING',
                    type: 'Performance', 
                    window: window,
                    message: 'LinkedIn export performance degraded: ' + metrics.avg_execution_time.toFixed(0) + 'ms',
                    threshold: MONITORING_CONFIG.WARNING_AVG_TIME + 'ms',
                    actual: metrics.avg_execution_time.toFixed(0) + 'ms',
                    impact: 'Performance optimization recommended'
                });
            }
            
            // Volume-based alerts
            if (window === 'realtime' && metrics.total_exports > 50) {
                alerts.push({
                    level: 'INFO',
                    type: 'High Volume',
                    window: window,
                    message: 'High LinkedIn export volume detected: ' + metrics.total_exports + ' exports in 15 minutes',
                    threshold: '50 exports/15min',
                    actual: metrics.total_exports + ' exports',
                    impact: 'Monitor for capacity planning'
                });
            }
            
        } catch (error) {
            gs.error('Alert condition checking error: ' + error.toString());
        }
        
        return alerts;
    }
    
    /**
     * Send alert notifications via configured channels
     * @param {Array} alerts - Array of alert objects
     */
    function sendAlertNotifications(alerts) {
        try {
            // Group alerts by level
            var criticalAlerts = alerts.filter(function(a) { return a.level === 'CRITICAL'; });
            var warningAlerts = alerts.filter(function(a) { return a.level === 'WARNING'; });
            var infoAlerts = alerts.filter(function(a) { return a.level === 'INFO'; });
            
            // Send critical alerts immediately
            if (criticalAlerts.length > 0) {
                sendEmailNotification(criticalAlerts, 'CRITICAL');
                sendSlackNotification(criticalAlerts, 'CRITICAL');
            }
            
            // Send warning alerts (may be batched)
            if (warningAlerts.length > 0) {
                sendEmailNotification(warningAlerts, 'WARNING');
            }
            
            // Log info alerts
            if (infoAlerts.length > 0) {
                gs.info('SNAS Info Alerts: ' + infoAlerts.length + ' informational alerts generated');
            }
            
        } catch (error) {
            gs.error('Notification sending error: ' + error.toString());
        }
    }
    
    /**
     * Send email notification for alerts
     * @param {Array} alerts - Alerts to include in notification
     * @param {string} level - Alert level
     */
    function sendEmailNotification(alerts, level) {
        try {
            if (!MONITORING_CONFIG.NOTIFICATION_EMAILS || MONITORING_CONFIG.NOTIFICATION_EMAILS.length === 0) {
                return;
            }
            
            var subject = '🎖️ SNAS LinkedIn Export ' + level + ' Alert - ' + alerts.length + ' issue(s)';
            var body = buildEmailBody(alerts, level);
            
            // Use ServiceNow's GlideEmailOutbound or gs.eventQueue for email
            var email = new GlideEmailOutbound();
            email.setSubject(subject);
            email.setBody(body);
            
            MONITORING_CONFIG.NOTIFICATION_EMAILS.forEach(function(emailAddr) {
                email.addAddress('to', emailAddr);
            });
            
            email.send();
            
            gs.info('SNAS Alert email sent to ' + MONITORING_CONFIG.NOTIFICATION_EMAILS.length + ' recipients');
            
        } catch (error) {
            gs.error('Email notification error: ' + error.toString());
        }
    }
    
    /**
     * Build email body for alerts
     * @param {Array} alerts - Alerts to include
     * @param {string} level - Alert level
     * @returns {string} Formatted email body
     */
    function buildEmailBody(alerts, level) {
        var body = 'SNAS LinkedIn Export Flow - ' + level + ' Alert Report\\n\\n';
        body += 'Timestamp: ' + new GlideDateTime().toString() + '\\n';
        body += 'Alert Level: ' + level + '\\n';
        body += 'Number of Issues: ' + alerts.length + '\\n\\n';
        
        body += 'ALERT DETAILS:\\n';
        body += '='.repeat(50) + '\\n\\n';
        
        alerts.forEach(function(alert, index) {
            body += (index + 1) + '. ' + alert.type + ' (' + alert.window + ')\\n';
            body += '   Message: ' + alert.message + '\\n';
            body += '   Expected: ' + alert.threshold + '\\n';
            body += '   Actual: ' + alert.actual + '\\n';
            body += '   Impact: ' + alert.impact + '\\n\\n';
        });
        
        body += 'RECOMMENDED ACTIONS:\\n';
        body += '='.repeat(50) + '\\n';
        
        if (level === 'CRITICAL') {
            body += '- Immediate investigation required\\n';
            body += '- Check LinkedIn API status and connectivity\\n';
            body += '- Review ServiceNow Flow execution logs\\n';
            body += '- Verify system resources and capacity\\n';
        } else if (level === 'WARNING') {
            body += '- Monitor trends and investigate if issues persist\\n';
            body += '- Review recent changes to the system\\n';
            body += '- Consider performance optimization measures\\n';
        }
        
        body += '\\nSNAS LinkedIn Export Flow Monitoring System\\n';
        body += 'Military-Grade Excellence in Technology Operations 🇺🇸';
        
        return body;
    }
    
    /**
     * Send Slack notification (if configured)
     * @param {Array} alerts - Alerts to send
     * @param {string} level - Alert level
     */
    function sendSlackNotification(alerts, level) {
        try {
            if (!MONITORING_CONFIG.SLACK_WEBHOOK) {
                return;
            }
            
            var color = level === 'CRITICAL' ? 'danger' : 'warning';
            var emoji = level === 'CRITICAL' ? '🚨' : '⚠️';
            
            var message = {
                text: emoji + ' SNAS LinkedIn Export ' + level + ' Alert',
                attachments: [{
                    color: color,
                    fields: alerts.map(function(alert) {
                        return {
                            title: alert.type + ' (' + alert.window + ')',
                            value: alert.message + '\\nThreshold: ' + alert.threshold + ' | Actual: ' + alert.actual,
                            short: false
                        };
                    })
                }]
            };
            
            // Send to Slack using REST call
            var request = new sn_ws.RESTMessageV2();
            request.setEndpoint(MONITORING_CONFIG.SLACK_WEBHOOK);
            request.setHttpMethod('POST');
            request.setRequestHeader('Content-Type', 'application/json');
            request.setRequestBody(JSON.stringify(message));
            
            var response = request.execute();
            
            if (response.getStatusCode() === 200) {
                gs.info('SNAS Alert sent to Slack successfully');
            } else {
                gs.warn('Slack notification failed: ' + response.getStatusCode());
            }
            
        } catch (error) {
            gs.error('Slack notification error: ' + error.toString());
        }
    }
    
    /**
     * Update alert status in system for tracking
     * @param {Array} alerts - Processed alerts
     */
    function updateAlertStatus(alerts) {
        try {
            // Store alert history in custom table or system logs
            alerts.forEach(function(alert) {
                gs.info('SNAS Alert [' + alert.level + ']: ' + alert.message);
            });
            
        } catch (error) {
            gs.error('Alert status update error: ' + error.toString());
        }
    }
    
    /**
     * Clean up old monitoring data to manage storage
     */
    function cleanupOldMonitoringData() {
        try {
            var cutoffDate = new GlideDateTime();
            cutoffDate.addDaysUTC(-MONITORING_CONFIG.KEEP_MONITORING_DATA_DAYS);
            
            // Clean up old export logs (optional - may want to keep for historical analysis)
            // This is commented out as export logs might be valuable for long-term analysis
            /*
            var oldLogs = new GlideRecord('x_snc_snas_port_snas_export_logs');
            oldLogs.addQuery('export_time', '<', cutoffDate);
            oldLogs.deleteMultiple();
            */
            
            gs.info('SNAS Monitoring data cleanup completed');
            
        } catch (error) {
            gs.error('Data cleanup error: ' + error.toString());
        }
    }
    
    /**
     * Store monitoring results for trend analysis
     * @param {Object} analysisResults - Analysis results to store
     */
    function storeMonitoringResults(analysisResults) {
        try {
            // Store summary metrics in a trending table (create if needed)
            for (var window in analysisResults) {
                var result = analysisResults[window];
                
                // Log key metrics for trending
                var trendingData = {
                    window: window,
                    timestamp: new GlideDateTime().toString(),
                    total_exports: result.metrics.exports.total_exports,
                    success_rate: result.metrics.exports.success_rate,
                    avg_execution_time: result.metrics.exports.avg_execution_time,
                    compliance_score: result.compliance.overall_score,
                    incidents_count: result.incidents.length
                };
                
                gs.info('SNAS Trending [' + window + ']: ' + JSON.stringify(trendingData));
            }
            
        } catch (error) {
            gs.error('Results storage error: ' + error.toString());
        }
    }
    
    /**
     * Create incident for monitoring system failures
     * @param {Error} error - The error that occurred
     */
    function createMonitoringSystemIncident(error) {
        try {
            var incident = new GlideRecord('incident');
            incident.initialize();
            incident.short_description = 'SNAS LinkedIn Export Monitoring System Failure';
            incident.description = 'The SNAS LinkedIn Export monitoring system encountered an error:\\n\\n' +
                                 'Error: ' + error.toString() + '\\n\\n' +
                                 'This may impact performance monitoring and alerting capabilities.';
            incident.priority = 2;
            incident.urgency = 2;
            incident.category = 'Software';
            incident.subcategory = 'Monitoring';
            incident.assignment_group = 'SNAS Support';
            
            incident.insert();
            
            gs.warn('Monitoring system incident created: ' + incident.number);
            
        } catch (incidentError) {
            gs.error('Error creating monitoring incident: ' + incidentError.toString());
        }
    }
    
    /**
     * Create inline monitor for basic functionality
     * @returns {Object} Basic monitor implementation
     */
    function createInlineMonitor() {
        return {
            analyze: function(hoursBack) {
                // Simplified analysis implementation
                var windowStart = new GlideDateTime();
                windowStart.addSeconds(-(hoursBack * 3600));
                
                var exportLogs = new GlideRecord('x_snc_snas_port_snas_export_logs');
                exportLogs.addQuery('export_time', '>=', windowStart);
                exportLogs.query();
                
                var metrics = {
                    total_exports: 0,
                    successful_exports: 0,
                    failed_exports: 0,
                    success_rate: 0,
                    avg_execution_time: 0,
                    execution_times: []
                };
                
                var executionTimes = [];
                
                while (exportLogs.next()) {
                    metrics.total_exports++;
                    
                    if (exportLogs.status == 'Success') {
                        metrics.successful_exports++;
                    } else {
                        metrics.failed_exports++;
                    }
                    
                    var execTime = parseInt(exportLogs.execution_time_ms) || 0;
                    if (execTime > 0) {
                        executionTimes.push(execTime);
                    }
                }
                
                if (metrics.total_exports > 0) {
                    metrics.success_rate = (metrics.successful_exports / metrics.total_exports) * 100;
                }
                
                if (executionTimes.length > 0) {
                    metrics.avg_execution_time = executionTimes.reduce(function(a, b) { return a + b; }) / executionTimes.length;
                }
                
                var complianceScore = 100;
                if (metrics.success_rate < 95) {
                    complianceScore -= (95 - metrics.success_rate) * 2;
                }
                if (metrics.avg_execution_time > 1800) {
                    complianceScore -= ((metrics.avg_execution_time - 1800) / 1800) * 20;
                }
                complianceScore = Math.max(0, complianceScore);
                
                return {
                    metrics: { exports: metrics },
                    compliance: { overall_score: complianceScore },
                    incidents: []
                };
            }
        };
    }
    
})();