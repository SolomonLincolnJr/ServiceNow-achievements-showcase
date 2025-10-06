/**
 * ServiceNow Achievements Showcase (SNAS) - Data Population API
 * 
 * Specialized REST API endpoints for populating and managing SNAS achievement data.
 * This addresses the data population issue by providing immediate data import capabilities.
 * 
 * Endpoints:
 * - POST /api/snas/populate-default-data - Import default achievement dataset
 * - POST /api/snas/import-csv-data - Import from CSV data
 * - GET /api/snas/data-status - Check current data status
 * - POST /api/snas/validate-data - Validate existing data integrity
 * 
 * @class SNASDataPopulationAPI
 * @author Solomon Washington
 * @version 1.0.0
 */
var SNASDataPopulationAPI = Class.create();
SNASDataPopulationAPI.prototype = {
    initialize: function() {
        this.dataLoader = new SNASDataLoader();
        this.LOG_SOURCE = 'SNAS_DATA_POPULATION_API';
    },

    /**
     * POST /api/snas/populate-default-data
     * Populates the SNAS instance with Solomon Lincoln Jr's complete achievement portfolio
     * This is the primary method to resolve the data population issue
     * 
     * @param {Object} request - ServiceNow REST request object
     * @returns {Object} JSON response with import results
     */
    populateDefaultData: function(request) {
        var startTime = new GlideDateTime().getNumericValue();
        
        try {
            gs.info(this.LOG_SOURCE + ': Starting default data population');
            
            // Parse request options
            var requestBody = request.body ? request.body.data : {};
            var clearExisting = requestBody.clear_existing || true; // Default to clearing existing data
            var validateOnly = requestBody.validate_only || false;
            
            // Import default achievement data
            var importResult = this.dataLoader.importDefaultAchievements();
            
            // Add API metadata
            importResult.api_metadata = {
                endpoint: 'POST /api/snas/populate-default-data',
                version: '1.0.0',
                user: gs.getUserName(),
                clear_existing: clearExisting,
                validate_only: validateOnly,
                timestamp: new GlideDateTime().toString()
            };
            
            var statusCode = importResult.success ? 200 : 500;
            return this._createResponse(statusCode, importResult);
            
        } catch (error) {
            gs.error(this.LOG_SOURCE + ': Default data population failed: ' + error.message);
            return this._createResponse(500, {
                success: false,
                error: 'Failed to populate default data',
                message: error.message,
                timestamp: new GlideDateTime().toString()
            });
        }
    },

    /**
     * POST /api/snas/import-csv-data  
     * Import achievement data from CSV format
     * 
     * @param {Object} request - ServiceNow REST request object
     * @returns {Object} JSON response with import results
     */
    importCSVData: function(request) {
        try {
            gs.info(this.LOG_SOURCE + ': Starting CSV data import');
            
            var requestBody = request.body ? request.body.data : {};
            
            // Validate CSV data parameter
            if (!requestBody.csv_data || !Array.isArray(requestBody.csv_data)) {
                return this._createResponse(400, {
                    success: false,
                    error: 'Invalid CSV data. Expected array of achievement objects.',
                    timestamp: new GlideDateTime().toString()
                });
            }
            
            var options = {
                clearExisting: requestBody.clear_existing || false,
                validateOnly: requestBody.validate_only || false,
                batchSize: requestBody.batch_size || 50
            };
            
            // Import the CSV data
            var importResult = this.dataLoader.populateAchievementData(requestBody.csv_data, options);
            
            // Add API metadata
            importResult.api_metadata = {
                endpoint: 'POST /api/snas/import-csv-data',
                version: '1.0.0',
                user: gs.getUserName(),
                options: options,
                timestamp: new GlideDateTime().toString()
            };
            
            var statusCode = importResult.success ? 200 : 500;
            return this._createResponse(statusCode, importResult);
            
        } catch (error) {
            gs.error(this.LOG_SOURCE + ': CSV import failed: ' + error.message);
            return this._createResponse(500, {
                success: false,
                error: 'Failed to import CSV data',
                message: error.message,
                timestamp: new GlideDateTime().toString()
            });
        }
    },

    /**
     * GET /api/snas/data-status
     * Check the current status of achievement data in the system
     * 
     * @param {Object} request - ServiceNow REST request object
     * @returns {Object} JSON response with data status
     */
    getDataStatus: function(request) {
        try {
            gs.info(this.LOG_SOURCE + ': Checking data status');
            
            var status = this._analyzeDataStatus();
            
            var result = {
                success: true,
                data_status: status,
                api_metadata: {
                    endpoint: 'GET /api/snas/data-status',
                    version: '1.0.0',
                    user: gs.getUserName(),
                    timestamp: new GlideDateTime().toString()
                }
            };
            
            return this._createResponse(200, result);
            
        } catch (error) {
            gs.error(this.LOG_SOURCE + ': Data status check failed: ' + error.message);
            return this._createResponse(500, {
                success: false,
                error: 'Failed to check data status',
                message: error.message,
                timestamp: new GlideDateTime().toString()
            });
        }
    },

    /**
     * POST /api/snas/validate-data
     * Validate and update existing achievement data integrity
     * 
     * @param {Object} request - ServiceNow REST request object
     * @returns {Object} JSON response with validation results
     */
    validateData: function(request) {
        try {
            gs.info(this.LOG_SOURCE + ': Starting data validation');
            
            var validationResult = this.dataLoader.validateAndUpdateExistingData();
            
            validationResult.api_metadata = {
                endpoint: 'POST /api/snas/validate-data',
                version: '1.0.0',
                user: gs.getUserName(),
                timestamp: new GlideDateTime().toString()
            };
            
            var statusCode = validationResult.success ? 200 : 500;
            return this._createResponse(statusCode, validationResult);
            
        } catch (error) {
            gs.error(this.LOG_SOURCE + ': Data validation failed: ' + error.message);
            return this._createResponse(500, {
                success: false,
                error: 'Failed to validate data',
                message: error.message,
                timestamp: new GlideDateTime().toString()
            });
        }
    },

    /**
     * POST /api/snas/reset-demo-data
     * Complete reset and population with demo data - useful for presentations
     * 
     * @param {Object} request - ServiceNow REST request object
     * @returns {Object} JSON response with reset results
     */
    resetDemoData: function(request) {
        try {
            gs.info(this.LOG_SOURCE + ': Starting demo data reset');
            
            // Clear existing data and populate with fresh demo data
            var importResult = this.dataLoader.importDefaultAchievements();
            
            if (importResult.success) {
                // Also validate and update priority scores
                var validationResult = this.dataLoader.validateAndUpdateExistingData();
                
                var result = {
                    success: true,
                    message: 'Demo data reset completed successfully',
                    import_results: importResult,
                    validation_results: validationResult,
                    ready_for_demo: true,
                    service_portal_url: 'https://' + gs.getProperty('instance_name') + '.service-now.com/sp?id=snas_achievement_dashboard',
                    api_metadata: {
                        endpoint: 'POST /api/snas/reset-demo-data',
                        version: '1.0.0',
                        user: gs.getUserName(),
                        timestamp: new GlideDateTime().toString()
                    }
                };
                
                return this._createResponse(200, result);
            } else {
                return this._createResponse(500, importResult);
            }
            
        } catch (error) {
            gs.error(this.LOG_SOURCE + ': Demo data reset failed: ' + error.message);
            return this._createResponse(500, {
                success: false,
                error: 'Failed to reset demo data',
                message: error.message,
                timestamp: new GlideDateTime().toString()
            });
        }
    },

    /**
     * GET /api/snas/achievement-summary
     * Get a summary of achievements with priority scoring
     * 
     * @param {Object} request - ServiceNow REST request object
     * @returns {Object} JSON response with achievement summary
     */
    getAchievementSummary: function(request) {
        try {
            gs.info(this.LOG_SOURCE + ': Generating achievement summary');
            
            var limit = parseInt(request.queryParams.limit) || 10;
            var audience = request.queryParams.audience || 'it_recruiters';
            
            var achievements = this._getTopAchievements(limit, audience);
            var summary = this._generateAchievementSummary(achievements);
            
            var result = {
                success: true,
                achievement_summary: summary,
                top_achievements: achievements,
                api_metadata: {
                    endpoint: 'GET /api/snas/achievement-summary',
                    version: '1.0.0',
                    limit: limit,
                    audience: audience,
                    timestamp: new GlideDateTime().toString()
                }
            };
            
            return this._createResponse(200, result);
            
        } catch (error) {
            gs.error(this.LOG_SOURCE + ': Achievement summary failed: ' + error.message);
            return this._createResponse(500, {
                success: false,
                error: 'Failed to generate achievement summary',
                message: error.message,
                timestamp: new GlideDateTime().toString()
            });
        }
    },

    /**
     * Analyze current data status in the system
     */
    _analyzeDataStatus: function() {
        var gr = new GlideRecord('x_snc_snas_port_achievement');
        gr.query();
        
        var totalCount = gr.getRowCount();
        var typeBreakdown = {};
        var issuerBreakdown = {};
        var recentCount = 0;
        var highPriorityCount = 0;
        
        gr.query();
        while (gr.next()) {
            var type = gr.getValue('type') || 'unknown';
            var issuer = gr.getValue('issuer') || 'unknown';
            var priority = parseInt(gr.getValue('priority_score')) || 0;
            var dateEarned = gr.getValue('date_earned');
            
            // Count by type
            typeBreakdown[type] = (typeBreakdown[type] || 0) + 1;
            
            // Count by issuer
            issuerBreakdown[issuer] = (issuerBreakdown[issuer] || 0) + 1;
            
            // Count high priority achievements (score >= 80)
            if (priority >= 80) {
                highPriorityCount++;
            }
            
            // Count recent achievements (within 6 months)
            if (dateEarned) {
                var earnedDate = new GlideDate();
                earnedDate.setValue(dateEarned);
                var currentDate = new GlideDate();
                var daysDiff = (currentDate.getNumericValue() - earnedDate.getNumericValue()) / (1000 * 60 * 60 * 24);
                
                if (daysDiff <= 180) { // 6 months
                    recentCount++;
                }
            }
        }
        
        return {
            total_achievements: totalCount,
            data_populated: totalCount > 0,
            type_breakdown: typeBreakdown,
            issuer_breakdown: issuerBreakdown,
            recent_achievements: recentCount,
            high_priority_achievements: highPriorityCount,
            data_quality: this._assessDataQuality(totalCount),
            recommended_actions: this._getRecommendedActions(totalCount)
        };
    },

    /**
     * Assess data quality based on record count and completeness
     */
    _assessDataQuality: function(totalCount) {
        if (totalCount === 0) {
            return {
                score: 'CRITICAL',
                message: 'No achievement data found. Data population required.',
                color: '#FF0000'
            };
        } else if (totalCount < 10) {
            return {
                score: 'LOW',
                message: 'Limited achievement data. Consider importing additional records.',
                color: '#FFA500'
            };
        } else if (totalCount < 25) {
            return {
                score: 'MEDIUM',
                message: 'Adequate achievement data. Consider validating data completeness.',
                color: '#FFFF00'
            };
        } else {
            return {
                score: 'HIGH',
                message: 'Comprehensive achievement data populated and ready.',
                color: '#00FF00'
            };
        }
    },

    /**
     * Get recommended actions based on current data state
     */
    _getRecommendedActions: function(totalCount) {
        var actions = [];
        
        if (totalCount === 0) {
            actions.push({
                action: 'populate_default_data',
                description: 'Import default SNAS achievement dataset',
                priority: 'CRITICAL',
                endpoint: 'POST /api/snas/populate-default-data'
            });
        } else if (totalCount < 25) {
            actions.push({
                action: 'validate_data',
                description: 'Validate and update existing achievement data',
                priority: 'HIGH',
                endpoint: 'POST /api/snas/validate-data'
            });
        }
        
        actions.push({
            action: 'check_priority_scores',
            description: 'Ensure all achievements have proper priority scoring',
            priority: 'MEDIUM',
            endpoint: 'POST /api/snas/validate-data'
        });
        
        return actions;
    },

    /**
     * Get top achievements based on priority score and audience
     */
    _getTopAchievements: function(limit, audience) {
        var gr = new GlideRecord('x_snc_snas_port_achievement');
        gr.addQuery('active', true);
        gr.orderByDesc('priority_score');
        gr.setLimit(limit);
        gr.query();
        
        var achievements = [];
        while (gr.next()) {
            achievements.push({
                name: gr.getValue('name'),
                type: gr.getValue('type'),
                issuer: gr.getValue('issuer'),
                category: gr.getValue('category'),
                priority_score: parseInt(gr.getValue('priority_score')),
                date_earned: gr.getValue('date_earned'),
                sys_id: gr.getUniqueValue()
            });
        }
        
        return achievements;
    },

    /**
     * Generate achievement portfolio summary
     */
    _generateAchievementSummary: function(achievements) {
        var certificationCount = 0;
        var badgeCount = 0;
        var achievementCount = 0;
        var serviceNowCount = 0;
        var veteranCount = 0;
        
        achievements.forEach(function(achievement) {
            switch (achievement.type) {
                case 'certification':
                    certificationCount++;
                    break;
                case 'badge':
                    badgeCount++;
                    break;
                case 'achievement':
                    achievementCount++;
                    break;
            }
            
            if (achievement.issuer && achievement.issuer.toLowerCase().includes('servicenow')) {
                serviceNowCount++;
            }
            
            if ((achievement.name && achievement.name.toLowerCase().includes('military')) ||
                (achievement.issuer && achievement.issuer.toLowerCase().includes('navy'))) {
                veteranCount++;
            }
        });
        
        return {
            total_achievements: achievements.length,
            certifications: certificationCount,
            badges: badgeCount,
            achievements: achievementCount,
            servicenow_focus: serviceNowCount,
            veteran_heritage: veteranCount,
            professional_readiness: 'EXCELLENT',
            presentation_ready: true
        };
    },

    /**
     * Create standardized REST API response
     */
    _createResponse: function(statusCode, data) {
        return {
            status: statusCode,
            headers: {
                'Content-Type': 'application/json',
                'X-SNAS-API-Version': '1.0.0',
                'X-SNAS-Data-Population': 'Active'
            },
            body: data
        };
    },

    type: 'SNASDataPopulationAPI'
};