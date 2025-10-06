/**
 * SNAS LinkedIn Export Flow - AJAX Script Include
 * 
 * Handles AJAX requests from the UI component to trigger and monitor
 * the LinkedIn export flow with proper security and performance controls.
 * 
 * Script Include Name: SNASLinkedInAjax
 * Application Scope: x_snc_snas_port
 * Accessible from: All application scopes
 */

var SNASLinkedInAjax = Class.create();

SNASLinkedInAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    
    /**
     * Trigger LinkedIn export flow for an achievement
     * Updates the achievement record to set export_requested = true
     * 
     * @returns {string} JSON response with success status and execution details
     */
    triggerExport: function() {
        var startTime = new Date().getTime();
        
        try {
            // Validate user permissions
            if (!this._hasValidPermissions()) {
                return this._createErrorResponse('Insufficient permissions to export achievements');
            }
            
            // Get and validate parameters
            var achievementId = this.getParameter('sysparm_achievement_id');
            var customContent = this.getParameter('sysparm_custom_content');
            
            if (!achievementId) {
                return this._createErrorResponse('Achievement ID is required');
            }
            
            // Validate achievement exists and user has access
            var achievement = new GlideRecord('x_snc_snas_port_snas_achievements');
            if (!achievement.get(achievementId)) {
                return this._createErrorResponse('Achievement not found or access denied');
            }
            
            // Verify ownership or admin access
            if (achievement.user_sys_id != gs.getUserID() && !gs.hasRole('admin') && !gs.hasRole('x_snc_snas_port.admin')) {
                return this._createErrorResponse('Access denied: You can only export your own achievements');
            }
            
            // Check if already being processed
            if (achievement.export_requested == true) {
                return this._createErrorResponse('Export already in progress for this achievement');
            }
            
            // Store custom content if provided
            if (customContent) {
                try {
                    var contentData = JSON.parse(customContent);
                    // Store in achievement record or session for flow to use
                    this._storeCustomContent(achievementId, contentData);
                } catch (e) {
                    gs.warn('SNAS LinkedIn: Invalid custom content JSON, using default generation');
                }
            }
            
            // Generate unique execution ID for tracking
            var executionId = 'snas_linkedin_' + achievementId + '_' + new Date().getTime();
            
            // Update achievement record to trigger flow
            achievement.export_requested = true;
            achievement.update();
            
            // Log the export request
            this._logExportRequest(achievementId, executionId);
            
            var executionTime = new Date().getTime() - startTime;
            
            // Performance monitoring
            if (gs.getProperty('x_snc_snas_port.linkedin_performance_monitoring') === 'true') {
                gs.info('SNAS LinkedIn Export Triggered: ' + achievementId + ' (' + executionTime + 'ms)');
            }
            
            return this._createSuccessResponse({
                execution_id: executionId,
                achievement_id: achievementId,
                execution_time_ms: executionTime,
                message: 'LinkedIn export initiated successfully'
            });
            
        } catch (error) {
            gs.error('SNAS LinkedIn Trigger Error: ' + error.toString());
            return this._createErrorResponse('Internal error occurred while triggering export');
        }
    },
    
    /**
     * Check flow execution status
     * Monitors the export log table for completion status
     * 
     * @returns {string} JSON response with flow completion status
     */
    checkFlowStatus: function() {
        try {
            var executionId = this.getParameter('sysparm_execution_id');
            
            if (!executionId) {
                return this._createErrorResponse('Execution ID is required');
            }
            
            // Extract achievement ID from execution ID
            var achievementId = executionId.split('_')[2];
            
            if (!achievementId) {
                return this._createErrorResponse('Invalid execution ID format');
            }
            
            // Check export logs for completion
            var exportLog = new GlideRecord('x_snc_snas_port_snas_export_logs');
            exportLog.addQuery('achievement_id', achievementId);
            exportLog.addQuery('flow_execution_id', executionId);
            exportLog.orderByDesc('export_time');
            exportLog.setLimit(1);
            exportLog.query();
            
            var response = {
                completed: false,
                success: false,
                execution_id: executionId,
                achievement_id: achievementId
            };
            
            if (exportLog.next()) {
                response.completed = true;
                response.success = (exportLog.status == 'Success');
                response.execution_time_ms = parseInt(exportLog.execution_time_ms) || 0;
                response.export_time = exportLog.export_time.toString();
                
                if (response.success) {
                    response.message = 'Achievement successfully shared to LinkedIn';
                    response.linkedin_response_id = exportLog.response_id.toString();
                } else {
                    response.error = exportLog.error_message.toString();
                    response.retry_count = parseInt(exportLog.retry_count) || 0;
                }
            } else {
                // Check if flow is still running by looking at achievement record
                var achievement = new GlideRecord('x_snc_snas_port_snas_achievements');
                if (achievement.get(achievementId)) {
                    if (achievement.export_requested == false) {
                        // Flow completed but no log found - possible error
                        response.completed = true;
                        response.success = false;
                        response.error = 'Export completed but no status log found';
                    }
                }
            }
            
            return JSON.stringify(response);
            
        } catch (error) {
            gs.error('SNAS LinkedIn Status Check Error: ' + error.toString());
            return this._createErrorResponse('Error checking flow status');
        }
    },
    
    /**
     * Get achievement details for UI display
     * Retrieves formatted achievement data for the component
     * 
     * @returns {string} JSON response with achievement details
     */
    getAchievementDetails: function() {
        try {
            var achievementId = this.getParameter('sysparm_achievement_id');
            
            if (!achievementId) {
                return this._createErrorResponse('Achievement ID is required');
            }
            
            var achievement = new GlideRecord('x_snc_snas_port_snas_achievements');
            if (!achievement.get(achievementId)) {
                return this._createErrorResponse('Achievement not found');
            }
            
            // Verify access permissions
            if (achievement.user_sys_id != gs.getUserID() && !gs.hasRole('admin') && !gs.hasRole('x_snc_snas_port.admin')) {
                return this._createErrorResponse('Access denied');
            }
            
            var achievementData = {
                sys_id: achievement.sys_id.toString(),
                title: achievement.title.toString(),
                description: achievement.description.toString(),
                category: achievement.category.toString(),
                priority_score: parseInt(achievement.priority_score) || 50,
                achievement_date: achievement.achievement_date.toString(),
                badge_image: achievement.badge_image.toString(),
                export_requested: achievement.export_requested == true,
                active: achievement.active == true
            };
            
            // Check export history
            var exportHistory = this._getExportHistory(achievementId);
            achievementData.export_history = exportHistory;
            
            return this._createSuccessResponse(achievementData);
            
        } catch (error) {
            gs.error('SNAS Achievement Details Error: ' + error.toString());
            return this._createErrorResponse('Error retrieving achievement details');
        }
    },
    
    /**
     * Cancel ongoing export process
     * Resets the export_requested flag if export is taking too long
     * 
     * @returns {string} JSON response with cancellation status
     */
    cancelExport: function() {
        try {
            var achievementId = this.getParameter('sysparm_achievement_id');
            
            if (!achievementId) {
                return this._createErrorResponse('Achievement ID is required');
            }
            
            var achievement = new GlideRecord('x_snc_snas_port_snas_achievements');
            if (!achievement.get(achievementId)) {
                return this._createErrorResponse('Achievement not found');
            }
            
            // Verify ownership
            if (achievement.user_sys_id != gs.getUserID() && !gs.hasRole('admin')) {
                return this._createErrorResponse('Access denied');
            }
            
            // Reset export flag
            achievement.export_requested = false;
            achievement.update();
            
            // Log cancellation
            var exportLog = new GlideRecord('x_snc_snas_port_snas_export_logs');
            exportLog.initialize();
            exportLog.achievement_id = achievementId;
            exportLog.export_time = new GlideDateTime();
            exportLog.status = 'Cancelled';
            exportLog.error_message = 'Export cancelled by user';
            exportLog.flow_execution_id = 'cancelled_' + new Date().getTime();
            exportLog.insert();
            
            return this._createSuccessResponse({
                message: 'Export cancelled successfully',
                achievement_id: achievementId
            });
            
        } catch (error) {
            gs.error('SNAS Cancel Export Error: ' + error.toString());
            return this._createErrorResponse('Error cancelling export');
        }
    },
    
    /**
     * Validate user permissions for LinkedIn export
     * @returns {boolean} True if user has required permissions
     */
    _hasValidPermissions: function() {
        // Check if user is logged in
        if (!gs.getUserID()) {
            return false;
        }
        
        // Check for required roles (customize based on requirements)
        if (gs.hasRole('admin') || gs.hasRole('x_snc_snas_port.admin') || gs.hasRole('x_snc_snas_port.user')) {
            return true;
        }
        
        // Allow users to export their own achievements
        return true;
    },
    
    /**
     * Store custom content for use in flow
     * @param {string} achievementId - Achievement sys_id
     * @param {Object} contentData - Custom content data
     */
    _storeCustomContent: function(achievementId, contentData) {
        try {
            // Store in user session or achievement record
            var sessionKey = 'snas_custom_content_' + achievementId;
            gs.getSession().putProperty(sessionKey, JSON.stringify(contentData));
            
            // Set expiration (10 minutes)
            setTimeout(function() {
                gs.getSession().putProperty(sessionKey, '');
            }, 600000);
            
        } catch (error) {
            gs.warn('SNAS Store Custom Content Error: ' + error.toString());
        }
    },
    
    /**
     * Get export history for achievement
     * @param {string} achievementId - Achievement sys_id
     * @returns {Array} Array of export history entries
     */
    _getExportHistory: function(achievementId) {
        var history = [];
        
        try {
            var exportLogs = new GlideRecord('x_snc_snas_port_snas_export_logs');
            exportLogs.addQuery('achievement_id', achievementId);
            exportLogs.orderByDesc('export_time');
            exportLogs.setLimit(5); // Last 5 attempts
            exportLogs.query();
            
            while (exportLogs.next()) {
                history.push({
                    export_time: exportLogs.export_time.toString(),
                    status: exportLogs.status.toString(),
                    execution_time_ms: parseInt(exportLogs.execution_time_ms) || 0,
                    error_message: exportLogs.error_message.toString(),
                    retry_count: parseInt(exportLogs.retry_count) || 0
                });
            }
            
        } catch (error) {
            gs.warn('SNAS Export History Error: ' + error.toString());
        }
        
        return history;
    },
    
    /**
     * Log export request for audit purposes
     * @param {string} achievementId - Achievement sys_id
     * @param {string} executionId - Flow execution ID
     */
    _logExportRequest: function(achievementId, executionId) {
        try {
            gs.info('SNAS LinkedIn Export Request: User ' + gs.getUserName() + 
                   ' requested export for achievement ' + achievementId + 
                   ' (Execution ID: ' + executionId + ')');
                   
        } catch (error) {
            gs.warn('SNAS Log Export Request Error: ' + error.toString());
        }
    },
    
    /**
     * Create success response JSON
     * @param {Object} data - Response data
     * @returns {string} JSON response
     */
    _createSuccessResponse: function(data) {
        return JSON.stringify({
            success: true,
            data: data,
            timestamp: new GlideDateTime().toString()
        });
    },
    
    /**
     * Create error response JSON
     * @param {string} message - Error message
     * @returns {string} JSON response
     */
    _createErrorResponse: function(message) {
        return JSON.stringify({
            success: false,
            error: message,
            timestamp: new GlideDateTime().toString()
        });
    },
    
    type: 'SNASLinkedInAjax'
});