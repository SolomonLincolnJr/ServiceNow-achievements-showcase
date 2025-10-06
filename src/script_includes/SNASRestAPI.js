/**
 * ServiceNow Achievements Showcase (SNAS) - REST API Endpoints
 * Implements the API endpoints specified in the Enhanced Grok Sharing Prompt:
 * - POST /api/v1/prioritize-badges
 * - GET /api/v1/content-suggestions
 * 
 * Provides RESTful API access to the AI-enhanced badge prioritization
 * and content generation capabilities for veteran career advancement.
 * 
 * @class SNASRestAPI
 * @author Solomon Washington
 * @version 1.0.0
 */
var SNASRestAPI = Class.create();
SNASRestAPI.prototype = {
    initialize: function() {
        this.achievementAPI = new AchievementAPI();
        this.LOG_SOURCE = 'SNAS_REST_API';
    },

    /**
     * POST /api/v1/prioritize-badges
     * Accepts user_profile, badges_array, context_parameters
     * Returns prioritized badges with AI scoring and reasoning
     * 
     * @param {Object} request - ServiceNow REST request object
     * @returns {Object} JSON response with prioritized badges
     */
    prioritizeBadges: function(request) {
        var startTime = new GlideDateTime().getNumericValue();
        
        try {
            // Log API access
            gs.info(this.LOG_SOURCE + ': Prioritize badges API called');
            
            // Parse request body
            var requestBody = request.body ? request.body.data : {};
            
            // Validate required parameters
            var validation = this._validatePrioritizeBadgesRequest(requestBody);
            if (!validation.valid) {
                return this._createResponse(400, {
                    success: false,
                    error: 'Invalid request parameters',
                    details: validation.errors,
                    api_version: '1.0.0',
                    timestamp: new GlideDateTime().toString()
                });
            }

            var userProfile = requestBody.user_profile || {};
            var badgesArray = requestBody.badges_array || [];
            var contextParameters = requestBody.context_parameters || {};

            // Set default context if not provided
            if (!contextParameters.target_audience) {
                contextParameters.target_audience = 'it_recruiters';
            }

            // Call the Achievement API for prioritization
            var result = this.achievementAPI.prioritizeBadges(userProfile, badgesArray, contextParameters);
            
            var endTime = new GlideDateTime().getNumericValue();
            var processingTime = endTime - startTime;
            
            // Add API-specific metadata
            result.api_metadata = {
                endpoint: 'POST /api/v1/prioritize-badges',
                version: '1.0.0',
                processing_time_ms: processingTime,
                request_id: gs.generateGUID(),
                veteran_mission_enabled: gs.getProperty('x_snc_snas_port.veteran_mission_enabled', 'true') === 'true'
            };

            return this._createResponse(200, result);
            
        } catch (error) {
            gs.error(this.LOG_SOURCE + ': Prioritize badges API error: ' + error.message);
            return this._createResponse(500, {
                success: false,
                error: 'Internal server error during badge prioritization',
                message: error.message,
                api_version: '1.0.0',
                timestamp: new GlideDateTime().toString()
            });
        }
    },

    /**
     * GET /api/v1/content-suggestions
     * Returns AI-generated content with confidence scores
     * Supports LinkedIn posts, badge descriptions, professional summaries
     * 
     * @param {Object} request - ServiceNow REST request object
     * @returns {Object} JSON response with content suggestions
     */
    getContentSuggestions: function(request) {
        var startTime = new GlideDateTime().getNumericValue();
        
        try {
            gs.info(this.LOG_SOURCE + ': Content suggestions API called');
            
            // Parse query parameters
            var badgeId = request.queryParams.badge_id;
            var contentType = request.queryParams.content_type || 'linkedin_post';
            var audience = request.queryParams.audience || 'it_recruiters';
            var includeVeteranNarrative = request.queryParams.veteran_narrative === 'true';

            // Validate parameters
            if (!badgeId) {
                return this._createResponse(400, {
                    success: false,
                    error: 'Missing required parameter: badge_id',
                    api_version: '1.0.0',
                    timestamp: new GlideDateTime().toString()
                });
            }

            // Get badge data
            var badgeData = this._getBadgeData(badgeId);
            if (!badgeData) {
                return this._createResponse(404, {
                    success: false,
                    error: 'Badge not found',
                    badge_id: badgeId,
                    api_version: '1.0.0',
                    timestamp: new GlideDateTime().toString()
                });
            }

            // Build context for content generation
            var context = {
                target_audience: audience,
                include_veteran_narrative: includeVeteranNarrative,
                service_to_success_alignment: true,
                professional_tone: true
            };

            // Generate content suggestions
            var result = this.achievementAPI.generateContentSuggestions(badgeData, contentType, context);
            
            var endTime = new GlideDateTime().getNumericValue();
            var processingTime = endTime - startTime;
            
            // Add API-specific metadata
            result.api_metadata = {
                endpoint: 'GET /api/v1/content-suggestions',
                version: '1.0.0',
                processing_time_ms: processingTime,
                request_id: gs.generateGUID(),
                badge_id: badgeId,
                content_type: contentType,
                target_audience: audience
            };

            return this._createResponse(200, result);
            
        } catch (error) {
            gs.error(this.LOG_SOURCE + ': Content suggestions API error: ' + error.message);
            return this._createResponse(500, {
                success: false,
                error: 'Internal server error during content generation',
                message: error.message,
                api_version: '1.0.0',
                timestamp: new GlideDateTime().toString()
            });
        }
    },

    /**
     * GET /api/v1/badges
     * Returns list of available badges with optional filtering
     * Supports the UI dashboard and external integrations
     * 
     * @param {Object} request - ServiceNow REST request object
     * @returns {Object} JSON response with badge list
     */
    getBadges: function(request) {
        try {
            gs.info(this.LOG_SOURCE + ': Get badges API called');
            
            var filters = {
                type: request.queryParams.type,
                issuer: request.queryParams.issuer,
                category: request.queryParams.category,
                active: request.queryParams.active !== 'false'
            };
            
            var limit = parseInt(request.queryParams.limit) || 50;
            var offset = parseInt(request.queryParams.offset) || 0;

            // Query badges from the achievement table
            var badges = this._queryBadges(filters, limit, offset);
            
            var result = {
                success: true,
                badges: badges.records,
                total_count: badges.totalCount,
                limit: limit,
                offset: offset,
                api_metadata: {
                    endpoint: 'GET /api/v1/badges',
                    version: '1.0.0',
                    filters_applied: filters,
                    timestamp: new GlideDateTime().toString()
                }
            };

            return this._createResponse(200, result);
            
        } catch (error) {
            gs.error(this.LOG_SOURCE + ': Get badges API error: ' + error.message);
            return this._createResponse(500, {
                success: false,
                error: 'Internal server error retrieving badges',
                message: error.message,
                api_version: '1.0.0',
                timestamp: new GlideDateTime().toString()
            });
        }
    },

    /**
     * POST /api/v1/badges
     * Creates or updates badge data
     * Supports the October 10 badge import requirement
     * 
     * @param {Object} request - ServiceNow REST request object
     * @returns {Object} JSON response confirming creation/update
     */
    createOrUpdateBadge: function(request) {
        try {
            gs.info(this.LOG_SOURCE + ': Create/update badge API called');
            
            var requestBody = request.body ? request.body.data : {};
            
            // Validate badge data
            var validation = this._validateBadgeData(requestBody);
            if (!validation.valid) {
                return this._createResponse(400, {
                    success: false,
                    error: 'Invalid badge data',
                    details: validation.errors,
                    api_version: '1.0.0',
                    timestamp: new GlideDateTime().toString()
                });
            }

            // Create or update badge record
            var badgeResult = this._createOrUpdateBadgeRecord(requestBody);
            
            var result = {
                success: true,
                badge_id: badgeResult.badgeId,
                action: badgeResult.action,
                badge_data: badgeResult.badgeData,
                api_metadata: {
                    endpoint: 'POST /api/v1/badges',
                    version: '1.0.0',
                    veteran_mission_aligned: true,
                    timestamp: new GlideDateTime().toString()
                }
            };

            return this._createResponse(badgeResult.action === 'created' ? 201 : 200, result);
            
        } catch (error) {
            gs.error(this.LOG_SOURCE + ': Create badge API error: ' + error.message);
            return this._createResponse(500, {
                success: false,
                error: 'Internal server error creating/updating badge',
                message: error.message,
                api_version: '1.0.0',
                timestamp: new GlideDateTime().toString()
            });
        }
    },

    /**
     * Validate prioritize badges request parameters
     */
    _validatePrioritizeBadgesRequest: function(requestBody) {
        var errors = [];
        
        if (!requestBody) {
            errors.push('Request body is required');
            return { valid: false, errors: errors };
        }
        
        if (!requestBody.badges_array || !Array.isArray(requestBody.badges_array)) {
            errors.push('badges_array is required and must be an array');
        }
        
        if (requestBody.badges_array && requestBody.badges_array.length === 0) {
            errors.push('badges_array cannot be empty');
        }
        
        // Validate each badge in the array
        if (requestBody.badges_array && Array.isArray(requestBody.badges_array)) {
            for (var i = 0; i < requestBody.badges_array.length; i++) {
                var badge = requestBody.badges_array[i];
                if (!badge.name) {
                    errors.push('Badge at index ' + i + ' is missing required field: name');
                }
                if (!badge.id && !badge.sys_id) {
                    errors.push('Badge at index ' + i + ' is missing required field: id or sys_id');
                }
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Validate badge data for creation/update
     */
    _validateBadgeData: function(badgeData) {
        var errors = [];
        var requiredFields = ['name', 'type', 'issuer'];
        
        for (var i = 0; i < requiredFields.length; i++) {
            var field = requiredFields[i];
            if (!badgeData[field]) {
                errors.push('Missing required field: ' + field);
            }
        }
        
        // Validate badge type
        var validTypes = ['certification', 'badge', 'achievement'];
        if (badgeData.type && validTypes.indexOf(badgeData.type) === -1) {
            errors.push('Invalid badge type. Must be one of: ' + validTypes.join(', '));
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Get badge data from the achievement table
     */
    _getBadgeData: function(badgeId) {
        var gr = new GlideRecord('x_snc_snas_port_achievement');
        if (gr.get(badgeId)) {
            return {
                id: gr.getUniqueValue(),
                name: gr.getValue('name'),
                type: gr.getValue('type'),
                issuer: gr.getValue('issuer'),
                description: gr.getValue('description'),
                category: gr.getValue('category'),
                date_earned: gr.getValue('date_earned'),
                active: gr.getValue('active') === 'true'
            };
        }
        return null;
    },

    /**
     * Query badges from the achievement table with filtering
     */
    _queryBadges: function(filters, limit, offset) {
        var gr = new GlideRecord('x_snc_snas_port_achievement');
        
        // Apply filters
        if (filters.type) {
            gr.addQuery('type', filters.type);
        }
        if (filters.issuer) {
            gr.addQuery('issuer', 'CONTAINS', filters.issuer);
        }
        if (filters.category) {
            gr.addQuery('category', filters.category);
        }
        if (filters.active !== undefined) {
            gr.addQuery('active', filters.active);
        }
        
        // Get total count before applying pagination
        gr.query();
        var totalCount = gr.getRowCount();
        
        // Apply pagination
        gr.chooseWindow(offset, offset + limit);
        gr.orderByDesc('sys_created_on');
        gr.query();
        
        var records = [];
        while (gr.next()) {
            records.push({
                id: gr.getUniqueValue(),
                name: gr.getValue('name'),
                type: gr.getValue('type'),
                issuer: gr.getValue('issuer'),
                description: gr.getValue('description'),
                category: gr.getValue('category'),
                date_earned: gr.getValue('date_earned'),
                active: gr.getValue('active') === 'true',
                created_on: gr.getValue('sys_created_on')
            });
        }
        
        return {
            records: records,
            totalCount: totalCount
        };
    },

    /**
     * Create or update badge record in the achievement table
     */
    _createOrUpdateBadgeRecord: function(badgeData) {
        var gr = new GlideRecord('x_snc_snas_port_achievement');
        var action = 'created';
        var badgeId;
        
        // Check if badge already exists (by name and issuer)
        gr.addQuery('name', badgeData.name);
        gr.addQuery('issuer', badgeData.issuer);
        gr.query();
        
        if (gr.next()) {
            action = 'updated';
            badgeId = gr.getUniqueValue();
        } else {
            gr.initialize();
            badgeId = gr.getUniqueValue();
        }
        
        // Set field values
        gr.setValue('name', badgeData.name);
        gr.setValue('type', badgeData.type);
        gr.setValue('issuer', badgeData.issuer);
        gr.setValue('description', badgeData.description || '');
        gr.setValue('category', badgeData.category || '');
        gr.setValue('date_earned', badgeData.date_earned || new GlideDateTime().toString());
        gr.setValue('active', badgeData.active !== false);
        
        // Insert or update
        if (action === 'created') {
            badgeId = gr.insert();
        } else {
            gr.update();
        }
        
        return {
            action: action,
            badgeId: badgeId,
            badgeData: {
                id: badgeId,
                name: badgeData.name,
                type: badgeData.type,
                issuer: badgeData.issuer
            }
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
                'X-SNAS-Veteran-Mission': 'Service-to-Success'
            },
            body: data
        };
    },

    type: 'SNASRestAPI'
};