/**
 * ServiceNow Achievements Showcase (SNAS) - Badge Utilities
 * Comprehensive badge and accolade management with CSV import capabilities
 * Supporting the ServiceToSuccess veteran career advancement initiative
 * 
 * @class BadgeUtils
 * @author Solomon Washington
 * @version 1.0.0
 */
var BadgeUtils = Class.create();
BadgeUtils.prototype = {
    initialize: function() {
        this.LOG_SOURCE = 'SNAS_BADGE_UTILS';
        this.BADGE_TABLE = 'x_snc_snas_port_achievement';
        this.ACCOLADE_TABLE = 'x_snc_snas_port_accolade';
        this.CSV_DELIMITER = ',';
        this.BATCH_SIZE = 50;
        
        // Veteran mission constants
        this.VETERAN_MISSION_ENABLED = gs.getProperty('x_snc_snas_port.veteran_mission_enabled', 'true') === 'true';
        this.SERVICE_TO_SUCCESS = 'ServiceToSuccess Initiative';
    },

    /**
     * Import badges from CSV data
     * Supports the October 10 data import requirement
     * 
     * @param {String} csvData - CSV formatted badge data
     * @param {Boolean} overwriteExisting - Whether to overwrite existing badges
     * @returns {Object} Import results with statistics
     */
    importBadgesFromCSV: function(csvData, overwriteExisting) {
        var startTime = new GlideDateTime().getNumericValue();
        var results = {
            success: true,
            imported: 0,
            updated: 0,
            errors: [],
            warnings: [],
            processing_time_ms: 0
        };

        try {
            gs.info(this.LOG_SOURCE + ': Starting CSV badge import');
            
            // Parse CSV data
            var csvLines = this._parseCSVData(csvData);
            if (csvLines.length === 0) {
                throw new Error('No valid CSV data found');
            }

            var headers = csvLines[0];
            var expectedHeaders = ['name', 'type', 'issuer', 'description', 'category', 'date_earned'];
            
            // Validate CSV headers
            var headerValidation = this._validateCSVHeaders(headers, expectedHeaders);
            if (!headerValidation.valid) {
                throw new Error('Invalid CSV headers: ' + headerValidation.errors.join(', '));
            }

            // Process badge records
            for (var i = 1; i < csvLines.length; i++) {
                try {
                    var badgeData = this._parseCSVRow(csvLines[i], headers);
                    var importResult = this._importBadgeRecord(badgeData, overwriteExisting);
                    
                    if (importResult.action === 'created') {
                        results.imported++;
                    } else if (importResult.action === 'updated') {
                        results.updated++;
                    }
                    
                } catch (rowError) {
                    results.errors.push('Row ' + (i + 1) + ': ' + rowError.message);
                    gs.error(this.LOG_SOURCE + ': Row import error: ' + rowError.message);
                }
            }

            // Calculate processing time
            var endTime = new GlideDateTime().getNumericValue();
            results.processing_time_ms = endTime - startTime;
            
            gs.info(this.LOG_SOURCE + ': CSV import completed - Imported: ' + results.imported + ', Updated: ' + results.updated);
            
            return results;
            
        } catch (error) {
            results.success = false;
            results.errors.push('Import failed: ' + error.message);
            gs.error(this.LOG_SOURCE + ': CSV import failed: ' + error.message);
            return results;
        }
    },

    /**
     * Import accolades from CSV data
     * Supporting community recognition and achievements
     * 
     * @param {String} csvData - CSV formatted accolade data
     * @param {Boolean} overwriteExisting - Whether to overwrite existing accolades
     * @returns {Object} Import results with statistics
     */
    importAccoladesFromCSV: function(csvData, overwriteExisting) {
        var startTime = new GlideDateTime().getNumericValue();
        var results = {
            success: true,
            imported: 0,
            updated: 0,
            errors: [],
            warnings: [],
            processing_time_ms: 0
        };

        try {
            gs.info(this.LOG_SOURCE + ': Starting CSV accolade import');
            
            var csvLines = this._parseCSVData(csvData);
            if (csvLines.length === 0) {
                throw new Error('No valid CSV data found');
            }

            var headers = csvLines[0];
            var expectedHeaders = ['title', 'source', 'description', 'achievement_date', 'category', 'impact_level'];
            
            var headerValidation = this._validateCSVHeaders(headers, expectedHeaders);
            if (!headerValidation.valid) {
                throw new Error('Invalid CSV headers: ' + headerValidation.errors.join(', '));
            }

            // Process accolade records
            for (var i = 1; i < csvLines.length; i++) {
                try {
                    var accoladeData = this._parseCSVRow(csvLines[i], headers);
                    var importResult = this._importAccoladeRecord(accoladeData, overwriteExisting);
                    
                    if (importResult.action === 'created') {
                        results.imported++;
                    } else if (importResult.action === 'updated') {
                        results.updated++;
                    }
                    
                } catch (rowError) {
                    results.errors.push('Row ' + (i + 1) + ': ' + rowError.message);
                }
            }

            var endTime = new GlideDateTime().getNumericValue();
            results.processing_time_ms = endTime - startTime;
            
            return results;
            
        } catch (error) {
            results.success = false;
            results.errors.push('Import failed: ' + error.message);
            return results;
        }
    },

    /**
     * Validate badge data integrity and veteran mission alignment
     * 
     * @param {String} badgeId - Badge ID to validate
     * @returns {Object} Validation results with recommendations
     */
    validateBadgeData: function(badgeId) {
        try {
            var gr = new GlideRecord(this.BADGE_TABLE);
            if (!gr.get(badgeId)) {
                return {
                    valid: false,
                    errors: ['Badge not found'],
                    recommendations: []
                };
            }

            var validation = {
                valid: true,
                errors: [],
                warnings: [],
                recommendations: [],
                veteran_mission_score: 0
            };

            // Validate required fields
            var requiredFields = ['name', 'type', 'issuer', 'date_earned'];
            for (var i = 0; i < requiredFields.length; i++) {
                var field = requiredFields[i];
                if (!gr.getValue(field)) {
                    validation.errors.push('Missing required field: ' + field);
                    validation.valid = false;
                }
            }

            // Validate data quality
            this._validateBadgeQuality(gr, validation);
            
            // Assess veteran mission alignment
            this._assessVeteranMissionAlignment(gr, validation);

            return validation;
            
        } catch (error) {
            return {
                valid: false,
                errors: ['Validation failed: ' + error.message],
                recommendations: []
            };
        }
    },

    /**
     * Generate badge statistics for dashboard display
     * 
     * @returns {Object} Comprehensive badge statistics
     */
    generateBadgeStatistics: function() {
        try {
            var stats = {
                total_badges: 0,
                certifications: 0,
                achievements: 0,
                servicenow_badges: 0,
                recent_badges: 0,
                veteran_aligned: 0,
                categories: {},
                issuers: {},
                recent_activity: []
            };

            // Count total badges
            var badgeGR = new GlideRecord(this.BADGE_TABLE);
            badgeGR.addQuery('active', true);
            badgeGR.query();
            stats.total_badges = badgeGR.getRowCount();

            // Detailed statistics
            while (badgeGR.next()) {
                // Count by type
                var badgeType = badgeGR.getValue('type');
                if (badgeType === 'certification') {
                    stats.certifications++;
                } else if (badgeType === 'achievement') {
                    stats.achievements++;
                }

                // ServiceNow specific badges
                var issuer = badgeGR.getValue('issuer');
                if (issuer && issuer.toLowerCase().includes('servicenow')) {
                    stats.servicenow_badges++;
                }

                // Recent badges (last 90 days)
                var dateEarned = badgeGR.getValue('date_earned');
                if (dateEarned && this._isRecentDate(dateEarned, 90)) {
                    stats.recent_badges++;
                }

                // Category distribution
                var category = badgeGR.getValue('category') || 'Uncategorized';
                stats.categories[category] = (stats.categories[category] || 0) + 1;

                // Issuer distribution
                stats.issuers[issuer] = (stats.issuers[issuer] || 0) + 1;

                // Veteran mission alignment
                if (this._assessBadgeVeteranAlignment(badgeGR)) {
                    stats.veteran_aligned++;
                }
            }

            // Generate recent activity
            stats.recent_activity = this._generateRecentActivity();

            return stats;
            
        } catch (error) {
            gs.error(this.LOG_SOURCE + ': Statistics generation failed: ' + error.message);
            return {
                error: 'Statistics generation failed',
                message: error.message
            };
        }
    },

    /**
     * Export badges to CSV format
     * Supporting data portability and backup requirements
     * 
     * @param {Object} filters - Export filters
     * @returns {String} CSV formatted badge data
     */
    exportBadgesToCSV: function(filters) {
        try {
            var csvData = [];
            var headers = ['name', 'type', 'issuer', 'description', 'category', 'date_earned', 'active', 'sys_id'];
            csvData.push(headers.join(this.CSV_DELIMITER));

            var gr = new GlideRecord(this.BADGE_TABLE);
            
            // Apply filters
            if (filters) {
                this._applyExportFilters(gr, filters);
            }
            
            gr.orderBy('date_earned');
            gr.query();

            while (gr.next()) {
                var row = [
                    this._escapeCSVField(gr.getValue('name')),
                    this._escapeCSVField(gr.getValue('type')),
                    this._escapeCSVField(gr.getValue('issuer')),
                    this._escapeCSVField(gr.getValue('description')),
                    this._escapeCSVField(gr.getValue('category')),
                    gr.getValue('date_earned'),
                    gr.getValue('active'),
                    gr.getUniqueValue()
                ];
                csvData.push(row.join(this.CSV_DELIMITER));
            }

            return csvData.join('\n');
            
        } catch (error) {
            gs.error(this.LOG_SOURCE + ': CSV export failed: ' + error.message);
            return null;
        }
    },

    /**
     * Clean and normalize badge data
     * Maintaining data quality standards
     */
    cleanBadgeData: function() {
        var cleaningResults = {
            processed: 0,
            cleaned: 0,
            errors: []
        };

        try {
            var gr = new GlideRecord(this.BADGE_TABLE);
            gr.query();

            while (gr.next()) {
                cleaningResults.processed++;
                
                var wasModified = false;
                
                // Normalize badge name
                var originalName = gr.getValue('name');
                var cleanedName = this._normalizeText(originalName);
                if (originalName !== cleanedName) {
                    gr.setValue('name', cleanedName);
                    wasModified = true;
                }

                // Normalize issuer
                var originalIssuer = gr.getValue('issuer');
                var cleanedIssuer = this._normalizeIssuer(originalIssuer);
                if (originalIssuer !== cleanedIssuer) {
                    gr.setValue('issuer', cleanedIssuer);
                    wasModified = true;
                }

                // Validate and normalize dates
                var dateEarned = gr.getValue('date_earned');
                if (dateEarned && !this._isValidDate(dateEarned)) {
                    gr.setValue('date_earned', new GlideDateTime().toString());
                    wasModified = true;
                }

                if (wasModified) {
                    gr.update();
                    cleaningResults.cleaned++;
                }
            }

            return cleaningResults;
            
        } catch (error) {
            cleaningResults.errors.push('Cleaning failed: ' + error.message);
            return cleaningResults;
        }
    },

    // Private helper methods

    /**
     * Parse CSV data into structured lines
     */
    _parseCSVData: function(csvData) {
        if (!csvData || typeof csvData !== 'string') {
            return [];
        }

        var lines = csvData.split('\n');
        var parsedLines = [];

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (line.length > 0) {
                parsedLines.push(this._parseCSVLine(line));
            }
        }

        return parsedLines;
    },

    /**
     * Parse individual CSV line handling quoted fields
     */
    _parseCSVLine: function(line) {
        var fields = [];
        var currentField = '';
        var inQuotes = false;

        for (var i = 0; i < line.length; i++) {
            var char = line.charAt(i);
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === this.CSV_DELIMITER && !inQuotes) {
                fields.push(currentField.trim());
                currentField = '';
            } else {
                currentField += char;
            }
        }
        
        fields.push(currentField.trim());
        return fields;
    },

    /**
     * Validate CSV headers against expected format
     */
    _validateCSVHeaders: function(headers, expectedHeaders) {
        var errors = [];
        
        for (var i = 0; i < expectedHeaders.length; i++) {
            var expectedHeader = expectedHeaders[i];
            if (headers.indexOf(expectedHeader) === -1) {
                errors.push('Missing required header: ' + expectedHeader);
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Parse CSV row into badge data object
     */
    _parseCSVRow: function(rowData, headers) {
        var badgeData = {};
        
        for (var i = 0; i < headers.length && i < rowData.length; i++) {
            var header = headers[i].toLowerCase().replace(/[^a-z0-9]/g, '_');
            badgeData[header] = rowData[i];
        }

        // Validate required fields
        if (!badgeData.name || !badgeData.type || !badgeData.issuer) {
            throw new Error('Missing required fields: name, type, or issuer');
        }

        return badgeData;
    },

    /**
     * Import individual badge record
     */
    _importBadgeRecord: function(badgeData, overwriteExisting) {
        var gr = new GlideRecord(this.BADGE_TABLE);
        var action = 'created';

        // Check for existing badge
        gr.addQuery('name', badgeData.name);
        gr.addQuery('issuer', badgeData.issuer);
        gr.query();

        if (gr.next()) {
            if (!overwriteExisting) {
                throw new Error('Badge already exists: ' + badgeData.name);
            }
            action = 'updated';
        } else {
            gr.initialize();
        }

        // Set field values
        gr.setValue('name', badgeData.name);
        gr.setValue('type', badgeData.type);
        gr.setValue('issuer', badgeData.issuer);
        gr.setValue('description', badgeData.description || '');
        gr.setValue('category', badgeData.category || '');
        gr.setValue('date_earned', badgeData.date_earned || new GlideDateTime().toString());
        gr.setValue('active', true);

        // Veteran mission tagging
        if (this.VETERAN_MISSION_ENABLED) {
            gr.setValue('veteran_aligned', this._assessBadgeVeteranAlignment(gr));
            gr.setValue('service_to_success', this.SERVICE_TO_SUCCESS);
        }

        if (action === 'created') {
            gr.insert();
        } else {
            gr.update();
        }

        return {
            action: action,
            badgeId: gr.getUniqueValue()
        };
    },

    /**
     * Additional helper methods for data quality and veteran mission alignment...
     */
    _normalizeText: function(text) {
        if (!text) return '';
        return text.trim().replace(/\s+/g, ' ');
    },

    _normalizeIssuer: function(issuer) {
        if (!issuer) return '';
        
        // Common issuer normalizations
        var normalized = issuer.trim();
        if (normalized.toLowerCase().includes('servicenow')) {
            return 'ServiceNow';
        }
        
        return normalized;
    },

    _isValidDate: function(dateStr) {
        try {
            var date = new GlideDate();
            date.setValue(dateStr);
            return true;
        } catch (e) {
            return false;
        }
    },

    _isRecentDate: function(dateStr, daysBack) {
        try {
            var earnedDate = new GlideDate();
            earnedDate.setValue(dateStr);
            var currentDate = new GlideDate();
            var daysDiff = Math.floor((currentDate.getNumericValue() - earnedDate.getNumericValue()) / (1000 * 60 * 60 * 24));
            return daysDiff <= daysBack;
        } catch (e) {
            return false;
        }
    },

    _assessBadgeVeteranAlignment: function(badgeGR) {
        // Check for veteran-relevant keywords and themes
        var name = (badgeGR.getValue('name') || '').toLowerCase();
        var description = (badgeGR.getValue('description') || '').toLowerCase();
        var category = (badgeGR.getValue('category') || '').toLowerCase();
        
        var veteranKeywords = ['leadership', 'service', 'excellence', 'discipline', 'mission', 'team'];
        var text = name + ' ' + description + ' ' + category;
        
        for (var i = 0; i < veteranKeywords.length; i++) {
            if (text.includes(veteranKeywords[i])) {
                return true;
            }
        }
        
        return false;
    },

    _escapeCSVField: function(field) {
        if (!field) return '';
        
        var escaped = field.toString().replace(/"/g, '""');
        if (escaped.includes(this.CSV_DELIMITER) || escaped.includes('\n') || escaped.includes('"')) {
            escaped = '"' + escaped + '"';
        }
        
        return escaped;
    },

    type: 'BadgeUtils'
};