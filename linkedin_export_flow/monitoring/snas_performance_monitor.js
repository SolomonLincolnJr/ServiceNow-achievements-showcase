/**
 * SNAS LinkedIn Export Flow - Performance Monitoring Script
 * 
 * Monitors flow performance against SLA targets and generates reports
 * SLA Targets: Total ~1.8s, AI <200ms, REST <800ms, Success Rate >95%
 * 
 * Usage: Execute as Scheduled Script Import or on-demand via Background Scripts
 */

(function SNASPerformanceMonitor() {
    'use strict';
    
    var PERFORMANCE_THRESHOLDS = {
        TOTAL_FLOW_SLA: 1800,      // 1.8s total execution
        AI_CONTENT_SLA: 200,       // 200ms AI content generation
        REST_CALL_SLA: 800,        // 800ms REST API call
        SUCCESS_RATE_TARGET: 95,   // 95% success rate
        UI_RENDER_SLA: 500         // 0.5s UI render time
    };
    
    var MONITORING_WINDOW = {
        HOURS_24: 24,
        HOURS_1: 1,
        MINUTES_15: 0.25
    };
    
    /**
     * Main monitoring function - analyzes performance over specified time window
     * @param {number} hoursBack - Hours to look back for analysis (default: 24)
     * @returns {Object} Performance analysis results
     */
    function analyzePerformance(hoursBack) {
        hoursBack = hoursBack || MONITORING_WINDOW.HOURS_24;
        
        var startTime = new Date().getTime();
        var windowStart = new GlideDateTime();
        windowStart.addSeconds(-(hoursBack * 3600));
        
        gs.info('🎖️ SNAS Performance Analysis Starting - Window: ' + hoursBack + ' hours');
        
        try {
            var results = {
                analysis_window: hoursBack + ' hours',
                timestamp: new GlideDateTime().toString(),
                sla_targets: PERFORMANCE_THRESHOLDS,
                metrics: {},
                compliance: {},
                recommendations: [],
                incidents: []
            };
            
            // Analyze export logs
            var exportMetrics = analyzeExportLogs(windowStart);
            results.metrics.exports = exportMetrics;
            
            // Analyze flow executions
            var flowMetrics = analyzeFlowExecutions(windowStart);
            results.metrics.flows = flowMetrics;
            
            // Calculate SLA compliance
            results.compliance = calculateSLACompliance(exportMetrics, flowMetrics);
            
            // Generate recommendations
            results.recommendations = generateRecommendations(results.compliance, exportMetrics);
            
            // Check for performance incidents
            results.incidents = identifyPerformanceIncidents(exportMetrics, flowMetrics);
            
            var analysisTime = new Date().getTime() - startTime;
            results.analysis_execution_time_ms = analysisTime;
            
            // Log results
            logPerformanceResults(results);
            
            // Create alerts if necessary
            handlePerformanceAlerts(results);
            
            gs.info('✅ SNAS Performance Analysis Complete (' + analysisTime + 'ms)');
            return results;
            
        } catch (error) {
            gs.error('❌ SNAS Performance Monitor Error: ' + error.toString());
            return null;
        }
    }
    
    /**
     * Analyze export log performance data
     * @param {GlideDateTime} windowStart - Start of analysis window
     * @returns {Object} Export metrics analysis
     */
    function analyzeExportLogs(windowStart) {
        var metrics = {
            total_exports: 0,
            successful_exports: 0,
            failed_exports: 0,
            success_rate: 0,
            avg_execution_time: 0,
            p95_execution_time: 0,
            p99_execution_time: 0,
            execution_times: [],
            error_analysis: {},
            user_activity: {}
        };
        
        try {
            // Query export logs within window
            var exportLogs = new GlideRecord('x_snc_snas_port_snas_export_logs');
            exportLogs.addQuery('export_time', '>=', windowStart);
            exportLogs.orderBy('export_time');
            exportLogs.query();
            
            var executionTimes = [];
            var errorCounts = {};
            var userCounts = {};
            
            while (exportLogs.next()) {
                metrics.total_exports++;
                
                var status = exportLogs.status.toString();
                if (status === 'Success') {
                    metrics.successful_exports++;
                } else {
                    metrics.failed_exports++;
                    
                    // Track error types
                    var errorType = extractErrorType(exportLogs.error_message.toString());
                    errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
                }
                
                // Track execution times
                var execTime = parseInt(exportLogs.execution_time_ms) || 0;
                if (execTime > 0) {
                    executionTimes.push(execTime);
                }
                
                // Track user activity (via achievement lookup)
                var achievement = getAchievementById(exportLogs.achievement_id.toString());
                if (achievement) {
                    var userId = achievement.user_sys_id.toString();
                    userCounts[userId] = (userCounts[userId] || 0) + 1;
                }
            }
            
            // Calculate derived metrics
            if (metrics.total_exports > 0) {
                metrics.success_rate = (metrics.successful_exports / metrics.total_exports) * 100;
            }
            
            if (executionTimes.length > 0) {
                metrics.execution_times = executionTimes.sort(function(a, b) { return a - b; });
                metrics.avg_execution_time = executionTimes.reduce(function(a, b) { return a + b; }) / executionTimes.length;
                metrics.p95_execution_time = getPercentile(executionTimes, 95);
                metrics.p99_execution_time = getPercentile(executionTimes, 99);
                metrics.min_execution_time = Math.min.apply(null, executionTimes);
                metrics.max_execution_time = Math.max.apply(null, executionTimes);
            }
            
            metrics.error_analysis = errorCounts;
            metrics.user_activity = userCounts;
            
        } catch (error) {
            gs.error('SNAS Export Logs Analysis Error: ' + error.toString());
        }
        
        return metrics;
    }
    
    /**
     * Analyze flow execution performance
     * @param {GlideDateTime} windowStart - Start of analysis window  
     * @returns {Object} Flow metrics analysis
     */
    function analyzeFlowExecutions(windowStart) {
        var metrics = {
            total_flows: 0,
            completed_flows: 0,
            failed_flows: 0,
            avg_flow_duration: 0,
            flow_durations: [],
            step_analysis: {}
        };
        
        try {
            // Query flow executions (if Flow Designer execution logs are available)
            // Note: This might require custom logging or accessing Flow execution tables
            
            // For now, we'll derive from export logs and achievement updates
            var achievements = new GlideRecord('x_snc_snas_port_snas_achievements');
            achievements.addQuery('sys_updated_on', '>=', windowStart);
            achievements.addQuery('export_requested', true);
            achievements.query();
            
            while (achievements.next()) {
                metrics.total_flows++;
                // Additional flow analysis would go here
            }
            
        } catch (error) {
            gs.error('SNAS Flow Executions Analysis Error: ' + error.toString());
        }
        
        return metrics;
    }
    
    /**
     * Calculate SLA compliance against targets
     * @param {Object} exportMetrics - Export performance metrics
     * @param {Object} flowMetrics - Flow performance metrics
     * @returns {Object} SLA compliance analysis
     */
    function calculateSLACompliance(exportMetrics, flowMetrics) {
        var compliance = {
            overall_score: 0,
            individual_metrics: {}
        };
        
        try {
            var scores = [];
            
            // Success Rate Compliance
            var successRateScore = Math.min(100, (exportMetrics.success_rate / PERFORMANCE_THRESHOLDS.SUCCESS_RATE_TARGET) * 100);
            compliance.individual_metrics.success_rate = {
                target: PERFORMANCE_THRESHOLDS.SUCCESS_RATE_TARGET + '%',
                actual: exportMetrics.success_rate.toFixed(2) + '%',
                score: successRateScore.toFixed(1),
                compliant: exportMetrics.success_rate >= PERFORMANCE_THRESHOLDS.SUCCESS_RATE_TARGET
            };
            scores.push(successRateScore);
            
            // Total Execution Time Compliance (P95)
            if (exportMetrics.p95_execution_time > 0) {
                var execTimeScore = exportMetrics.p95_execution_time <= PERFORMANCE_THRESHOLDS.TOTAL_FLOW_SLA ? 100 : 
                                   Math.max(0, 100 - ((exportMetrics.p95_execution_time - PERFORMANCE_THRESHOLDS.TOTAL_FLOW_SLA) / PERFORMANCE_THRESHOLDS.TOTAL_FLOW_SLA * 100));
                
                compliance.individual_metrics.execution_time = {
                    target: PERFORMANCE_THRESHOLDS.TOTAL_FLOW_SLA + 'ms',
                    actual: exportMetrics.p95_execution_time.toFixed(0) + 'ms (P95)',
                    score: execTimeScore.toFixed(1),
                    compliant: exportMetrics.p95_execution_time <= PERFORMANCE_THRESHOLDS.TOTAL_FLOW_SLA
                };
                scores.push(execTimeScore);
            }
            
            // Average Execution Time
            if (exportMetrics.avg_execution_time > 0) {
                var avgTimeScore = exportMetrics.avg_execution_time <= PERFORMANCE_THRESHOLDS.TOTAL_FLOW_SLA ? 100 :
                                  Math.max(0, 100 - ((exportMetrics.avg_execution_time - PERFORMANCE_THRESHOLDS.TOTAL_FLOW_SLA) / PERFORMANCE_THRESHOLDS.TOTAL_FLOW_SLA * 100));
                
                compliance.individual_metrics.avg_execution_time = {
                    target: PERFORMANCE_THRESHOLDS.TOTAL_FLOW_SLA + 'ms',
                    actual: exportMetrics.avg_execution_time.toFixed(0) + 'ms',
                    score: avgTimeScore.toFixed(1),
                    compliant: exportMetrics.avg_execution_time <= PERFORMANCE_THRESHOLDS.TOTAL_FLOW_SLA
                };
                scores.push(avgTimeScore);
            }
            
            // Calculate overall compliance score
            if (scores.length > 0) {
                compliance.overall_score = scores.reduce(function(a, b) { return a + b; }) / scores.length;
            }
            
            compliance.grade = getComplianceGrade(compliance.overall_score);
            
        } catch (error) {
            gs.error('SNAS SLA Compliance Calculation Error: ' + error.toString());
        }
        
        return compliance;
    }
    
    /**
     * Generate performance improvement recommendations
     * @param {Object} compliance - SLA compliance data
     * @param {Object} exportMetrics - Export performance metrics
     * @returns {Array} Array of recommendation objects
     */
    function generateRecommendations(compliance, exportMetrics) {
        var recommendations = [];
        
        try {
            // Success rate recommendations
            if (exportMetrics.success_rate < PERFORMANCE_THRESHOLDS.SUCCESS_RATE_TARGET) {
                recommendations.push({
                    priority: 'HIGH',
                    category: 'Success Rate',
                    issue: 'Success rate (' + exportMetrics.success_rate.toFixed(1) + '%) below SLA target (' + PERFORMANCE_THRESHOLDS.SUCCESS_RATE_TARGET + '%)',
                    recommendation: 'Review error analysis and implement retry logic improvements. Consider LinkedIn API rate limiting.',
                    impact: 'User experience and SLA compliance'
                });
            }
            
            // Performance recommendations
            if (exportMetrics.p95_execution_time > PERFORMANCE_THRESHOLDS.TOTAL_FLOW_SLA) {
                recommendations.push({
                    priority: 'MEDIUM',
                    category: 'Performance',
                    issue: 'P95 execution time (' + exportMetrics.p95_execution_time + 'ms) exceeds SLA target (' + PERFORMANCE_THRESHOLDS.TOTAL_FLOW_SLA + 'ms)',
                    recommendation: 'Optimize flow steps, review AI content generation performance, and implement async processing.',
                    impact: 'User experience and system scalability'
                });
            }
            
            // Error analysis recommendations
            var topErrors = getTopErrors(exportMetrics.error_analysis);
            topErrors.forEach(function(error) {
                if (error.count > (exportMetrics.total_exports * 0.05)) { // >5% of exports
                    recommendations.push({
                        priority: 'MEDIUM',
                        category: 'Error Handling',
                        issue: 'Frequent ' + error.type + ' errors (' + error.count + ' occurrences)',
                        recommendation: 'Implement specific handling for ' + error.type + ' errors and improve validation.',
                        impact: 'Error rate and user experience'
                    });
                }
            });
            
            // Volume-based recommendations
            if (exportMetrics.total_exports > 1000) {
                recommendations.push({
                    priority: 'LOW',
                    category: 'Scalability',
                    issue: 'High export volume (' + exportMetrics.total_exports + ' exports)',
                    recommendation: 'Consider implementing queue-based processing and load balancing for high-volume periods.',
                    impact: 'System performance and reliability'
                });
            }
            
        } catch (error) {
            gs.error('SNAS Recommendations Generation Error: ' + error.toString());
        }
        
        return recommendations;
    }
    
    /**
     * Identify performance incidents requiring attention
     * @param {Object} exportMetrics - Export performance metrics
     * @param {Object} flowMetrics - Flow performance metrics
     * @returns {Array} Array of incident objects
     */
    function identifyPerformanceIncidents(exportMetrics, flowMetrics) {
        var incidents = [];
        
        try {
            // Critical success rate incident
            if (exportMetrics.success_rate < 85) {
                incidents.push({
                    severity: 'CRITICAL',
                    type: 'Success Rate Degradation',
                    description: 'LinkedIn export success rate critically low: ' + exportMetrics.success_rate.toFixed(1) + '%',
                    threshold: '85%',
                    actual: exportMetrics.success_rate.toFixed(1) + '%',
                    action_required: 'Immediate investigation and remediation required'
                });
            }
            
            // Performance degradation incident
            if (exportMetrics.avg_execution_time > (PERFORMANCE_THRESHOLDS.TOTAL_FLOW_SLA * 1.5)) {
                incidents.push({
                    severity: 'HIGH',
                    type: 'Performance Degradation', 
                    description: 'Average execution time significantly exceeds SLA target',
                    threshold: PERFORMANCE_THRESHOLDS.TOTAL_FLOW_SLA + 'ms',
                    actual: exportMetrics.avg_execution_time.toFixed(0) + 'ms',
                    action_required: 'Performance optimization and capacity planning review needed'
                });
            }
            
            // Error spike incident
            if (exportMetrics.failed_exports > (exportMetrics.total_exports * 0.2)) {
                incidents.push({
                    severity: 'MEDIUM',
                    type: 'Error Rate Spike',
                    description: 'High error rate detected in LinkedIn exports',
                    threshold: '20% max error rate',
                    actual: ((exportMetrics.failed_exports / exportMetrics.total_exports) * 100).toFixed(1) + '%',
                    action_required: 'Error analysis and system health check required'
                });
            }
            
        } catch (error) {
            gs.error('SNAS Incident Identification Error: ' + error.toString());
        }
        
        return incidents;
    }
    
    /**
     * Log performance results for historical tracking
     * @param {Object} results - Performance analysis results
     */
    function logPerformanceResults(results) {
        try {
            // Create performance monitoring record (could be in a dedicated table)
            gs.info('📊 SNAS Performance Report:');
            gs.info('  Success Rate: ' + results.metrics.exports.success_rate.toFixed(2) + '% (Target: ' + PERFORMANCE_THRESHOLDS.SUCCESS_RATE_TARGET + '%)');
            gs.info('  Avg Execution: ' + results.metrics.exports.avg_execution_time.toFixed(0) + 'ms (Target: ' + PERFORMANCE_THRESHOLDS.TOTAL_FLOW_SLA + 'ms)');
            gs.info('  Total Exports: ' + results.metrics.exports.total_exports);
            gs.info('  Compliance Score: ' + results.compliance.overall_score.toFixed(1) + '% (' + results.compliance.grade + ')');
            
            if (results.recommendations.length > 0) {
                gs.info('  Recommendations: ' + results.recommendations.length + ' items identified');
            }
            
            if (results.incidents.length > 0) {
                gs.warn('⚠️  Performance Incidents: ' + results.incidents.length + ' requiring attention');
            }
            
        } catch (error) {
            gs.error('SNAS Performance Logging Error: ' + error.toString());
        }
    }
    
    /**
     * Handle performance alerts and notifications
     * @param {Object} results - Performance analysis results
     */
    function handlePerformanceAlerts(results) {
        try {
            // Send alerts for critical incidents
            results.incidents.forEach(function(incident) {
                if (incident.severity === 'CRITICAL') {
                    // Create ServiceNow incident or send notification
                    createPerformanceIncident(incident, results);
                }
            });
            
            // Send summary report if compliance is below threshold
            if (results.compliance.overall_score < 90) {
                sendPerformanceReport(results);
            }
            
        } catch (error) {
            gs.error('SNAS Performance Alerts Error: ' + error.toString());
        }
    }
    
    // Helper Functions
    
    function getPercentile(arr, percentile) {
        var index = Math.ceil((percentile / 100) * arr.length) - 1;
        return arr[Math.max(0, index)];
    }
    
    function extractErrorType(errorMessage) {
        if (!errorMessage) return 'Unknown';
        
        var errorTypes = {
            'timeout': /timeout|timed out/i,
            'authentication': /auth|unauthorized|401|403/i,
            'rate_limit': /rate limit|429/i,
            'network': /network|connection|dns/i,
            'validation': /validation|invalid|400/i,
            'server_error': /500|502|503|504/i
        };
        
        for (var type in errorTypes) {
            if (errorTypes[type].test(errorMessage)) {
                return type;
            }
        }
        
        return 'Other';
    }
    
    function getAchievementById(achievementId) {
        try {
            var achievement = new GlideRecord('x_snc_snas_port_snas_achievements');
            if (achievement.get(achievementId)) {
                return achievement;
            }
        } catch (error) {
            gs.warn('Error retrieving achievement: ' + error.toString());
        }
        return null;
    }
    
    function getComplianceGrade(score) {
        if (score >= 95) return 'A';
        if (score >= 90) return 'B';
        if (score >= 80) return 'C';
        if (score >= 70) return 'D';
        return 'F';
    }
    
    function getTopErrors(errorAnalysis) {
        var errors = [];
        for (var type in errorAnalysis) {
            errors.push({ type: type, count: errorAnalysis[type] });
        }
        return errors.sort(function(a, b) { return b.count - a.count; }).slice(0, 5);
    }
    
    function createPerformanceIncident(incident, results) {
        try {
            var incidentRecord = new GlideRecord('incident');
            incidentRecord.initialize();
            incidentRecord.short_description = 'SNAS LinkedIn Export Performance Issue: ' + incident.type;
            incidentRecord.description = incident.description + '\\n\\nThreshold: ' + incident.threshold + 
                                       '\\nActual: ' + incident.actual + '\\nAction Required: ' + incident.action_required;
            incidentRecord.priority = incident.severity === 'CRITICAL' ? 1 : 2;
            incidentRecord.urgency = incident.severity === 'CRITICAL' ? 1 : 2;
            incidentRecord.category = 'Software';
            incidentRecord.subcategory = 'Performance';
            incidentRecord.assignment_group = 'SNAS Support';
            
            incidentRecord.insert();
            gs.info('Performance incident created: ' + incidentRecord.number);
            
        } catch (error) {
            gs.error('Error creating performance incident: ' + error.toString());
        }
    }
    
    function sendPerformanceReport(results) {
        // Implementation for sending performance report via email/notification
        gs.info('Performance report notification would be sent here');
    }
    
    // Public interface
    return {
        analyze: analyzePerformance,
        analyzeExports: analyzeExportLogs,
        analyzeFlows: analyzeFlowExecutions
    };
    
})();