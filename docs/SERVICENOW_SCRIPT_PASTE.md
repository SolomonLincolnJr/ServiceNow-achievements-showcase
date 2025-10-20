# ServiceNow Script Includes - Ready to Paste

## 📋 Script Include: AchievementAPI

**Configuration**:
- Name: `AchievementAPI`
- API Name: `AchievementAPI`
- Description: `AI-Powered Badge Prioritization Engine with Manus.ai Integration`
- Application: ServiceNow Achievements Showcase
- Active: ✅ Checked
- Client Callable: ❌ Unchecked

**Script Content** (Copy and paste entire content below):

```javascript
/**
 * ServiceNow Achievements Showcase (SNAS) - AI Integration Script Include
 * Epic 3 (SNAS-E3): Intelligent Badge Prioritization and Content Generation
 * 
 * Integrates with Manus.ai API for context-aware badge prioritization
 * Supporting veteran career advancement through professional excellence demonstration
 * 
 * @class AchievementAPI
 * @author Solomon Washington
 * @version 1.0.0
 * @instance dev231111.service-now.com
 */
var AchievementAPI = Class.create();
AchievementAPI.prototype = {
    initialize: function() {
        this.API_BASE_URL = gs.getProperty('x_snc_snas_port.manus_ai_base_url', 'https://api.manus.ai/v1');
        this.API_KEY = gs.getProperty('x_snc_snas_port.manus_ai_api_key', '');
        this.API_TIMEOUT_MS = parseInt(gs.getProperty('x_snc_snas_port.api_timeout_ms', '1500'));
        this.PERFORMANCE_SLA_MS = 2000; // <2 second response times per requirement
        this.CACHE_DURATION_MS = 300000; // 5 minutes cache for performance
        
        // Algorithm weights (SNAS-11 requirement)
        this.CSA_PRIORITY_BOOST = parseInt(gs.getProperty('x_snc_snas_port.csa_priority_boost', '25'));
        this.RECENT_ACHIEVEMENT_BOOST = parseInt(gs.getProperty('x_snc_snas_port.recent_achievement_boost', '20'));
        this.CERTIFICATION_BOOST = parseInt(gs.getProperty('x_snc_snas_port.certification_boost', '30'));
        this.GENSPARK_AI_BOOST = 35; // Special boost for Genspark.ai demonstration
        
        // Veteran mission branding colors
        this.VETERAN_COLORS = {
            NAVY: gs.getProperty('x_snc_snas_port.veteran_brand_primary', '#1B365D'),
            GOLD: gs.getProperty('x_snc_snas_port.veteran_brand_secondary', '#FFD700')
        };
        
        this.AUDIENCE_TYPES = {
            IT_RECRUITERS: 'it_recruiters',
            VETERAN_COMMUNITY: 'veteran_community',
            SERVICENOW_PROFESSIONALS: 'servicenow_professionals',
            GENSPARK_AI_PARTNERS: 'genspark_ai_partners'
        };
        
        // Performance monitoring
        this.performanceMetrics = {
            apiCallCount: 0,
            averageResponseTime: 0,
            slaViolations: 0,
            cacheHits: 0
        };
        
        // Initialize HTTP client for Manus.ai integration
        this.httpClient = new sn_ws.RESTMessageV2();
    },

    /**
     * Main entry point for badge prioritization
     * POST /api/v1/prioritize-badges equivalent
     */
    prioritizeBadges: function(userProfile, badgesArray, contextParameters) {
        var startTime = new GlideDateTime().getNumericValue();
        
        try {
            // Input validation
            if (!userProfile || !badgesArray || !Array.isArray(badgesArray)) {
                return this._createErrorResponse('Invalid input parameters', 400);
            }

            // Apply context-aware scoring algorithm
            var scoredBadges = this._calculateBadgeScores(badgesArray, userProfile, contextParameters);
            
            // Sort by priority score (highest first)
            scoredBadges.sort(function(a, b) { return b.priority_score - a.priority_score; });
            
            // Generate AI-enhanced content if Manus.ai is available
            var aiEnhancedBadges = this._enhanceWithAI(scoredBadges, contextParameters);
            
            var endTime = new GlideDateTime().getNumericValue();
            var processingTime = endTime - startTime;
            
            // Ensure SLA compliance (<2 seconds)
            if (processingTime > this.PERFORMANCE_SLA_MS) {
                gs.warn('SNAS AchievementAPI: Processing time exceeded SLA: ' + processingTime + 'ms');
            }
            
            return {
                success: true,
                processing_time_ms: processingTime,
                badges: aiEnhancedBadges,
                context: contextParameters,
                metadata: {
                    total_badges: badgesArray.length,
                    prioritization_algorithm: 'context_aware_veteran_focused_v1',
                    sla_compliant: processingTime <= this.PERFORMANCE_SLA_MS
                }
            };
            
        } catch (error) {
            gs.error('SNAS AchievementAPI: Badge prioritization failed: ' + error.message);
            return this._createErrorResponse('Badge prioritization failed: ' + error.message, 500);
        }
    },

    /**
     * Context-aware badge scoring algorithm
     * Implements temporal relevance and audience-specific weighting
     */
    _calculateBadgeScores: function(badges, userProfile, context) {
        var self = this;
        var scoredBadges = [];
        
        badges.forEach(function(badge) {
            var baseScore = 50; // Base score for all badges
            var priorityScore = baseScore;
            var reasoning = [];
            
            // CSA Certification Priority Boost (+25 points for IT role targeting)
            if (badge.name && badge.name.toLowerCase().indexOf('csa') !== -1) {
                priorityScore += self.CSA_PRIORITY_BOOST;
                reasoning.push('CSA certification priority boost (+' + self.CSA_PRIORITY_BOOST + ')');
            }
            
            // Temporal relevance scoring
            var daysSinceEarned = self._calculateDaysSince(badge.date_earned);
            if (daysSinceEarned <= 90) { // Recent achievements (3 months)
                priorityScore += self.RECENT_ACHIEVEMENT_BOOST;
                reasoning.push('Recent achievement boost (+' + self.RECENT_ACHIEVEMENT_BOOST + ')');
            }
            
            // Certification vs Achievement differentiation
            if (badge.type === 'certification') {
                priorityScore += self.CERTIFICATION_BOOST;
                reasoning.push('Certification type boost (+' + self.CERTIFICATION_BOOST + ')');
            }
            
            // Audience-specific weighting
            if (context && context.target_audience) {
                var audienceBoost = self._calculateAudienceBoost(badge, context.target_audience);
                priorityScore += audienceBoost;
                if (audienceBoost > 0) {
                    reasoning.push('Audience targeting boost (+' + audienceBoost + ')');
                }
            }
            
            // ServiceNow professional relevance
            if (badge.issuer && badge.issuer.toLowerCase().indexOf('servicenow') !== -1) {
                priorityScore += 15;
                reasoning.push('ServiceNow platform relevance (+15)');
            }
            
            scoredBadges.push({
                badge_id: badge.id || badge.name,
                badge_data: badge,
                priority_score: priorityScore,
                reasoning: reasoning,
                display_weight: self._calculateDisplayWeight(priorityScore),
                engagement_prediction: self._predictEngagement(badge, priorityScore)
            });
        });
        
        return scoredBadges;
    },

    /**
     * Calculate audience-specific boost based on target audience
     */
    _calculateAudienceBoost: function(badge, targetAudience) {
        switch (targetAudience) {
            case this.AUDIENCE_TYPES.IT_RECRUITERS:
                if (badge.name && (badge.name.indexOf('CSA') !== -1 || badge.name.indexOf('CIS') !== -1)) {
                    return 20;
                }
                if (badge.name && badge.name.toLowerCase().indexOf('automation') !== -1) {
                    return 18;
                }
                break;
            case this.AUDIENCE_TYPES.VETERAN_COMMUNITY:
                if (badge.description && badge.description.toLowerCase().indexOf('leadership') !== -1) {
                    return 15;
                }
                if (badge.name && badge.name.toLowerCase().indexOf('service') !== -1) {
                    return 12;
                }
                break;
            case this.AUDIENCE_TYPES.SERVICENOW_PROFESSIONALS:
                if (badge.issuer && badge.issuer.toLowerCase().indexOf('servicenow') !== -1) {
                    return 25;
                }
                break;
            case this.AUDIENCE_TYPES.GENSPARK_AI_PARTNERS:
                if (badge.name && (badge.name.toLowerCase().indexOf('ai') !== -1 || 
                    badge.name.toLowerCase().indexOf('automation') !== -1 ||
                    badge.name.toLowerCase().indexOf('csa') !== -1)) {
                    return this.GENSPARK_AI_BOOST;
                }
                if (badge.type === 'certification') {
                    return 30;
                }
                return 20;
        }
        return 0;
    },

    /**
     * Enhanced AI content generation with Manus.ai integration
     */
    _enhanceWithAI: function(scoredBadges, context) {
        if (!this._isManusAIAvailable()) {
            return this._applyFallbackEnhancement(scoredBadges);
        }
        
        try {
            var self = this;
            var enhancedBadges = [];
            
            scoredBadges.forEach(function(badge) {
                var cacheKey = 'snas_ai_' + badge.badge_id + '_' + (context.target_audience || 'default');
                var cachedContent = self._getCachedContent(cacheKey);
                
                if (cachedContent) {
                    self.performanceMetrics.cacheHits++;
                    badge.ai_generated_content = cachedContent;
                    badge.ai_generated_content.cache_hit = true;
                } else {
                    var aiContent = self._callManusAI(badge.badge_data, context);
                    badge.ai_generated_content = aiContent;
                    badge.ai_generated_content.cache_hit = false;
                    self._setCachedContent(cacheKey, aiContent);
                }
                
                enhancedBadges.push(badge);
            });
            
            return enhancedBadges;
            
        } catch (error) {
            gs.error('SNAS AchievementAPI: Manus.ai integration failed: ' + error.message);
            return this._applyFallbackEnhancement(scoredBadges);
        }
    },

    /**
     * Fallback algorithm for API unavailability
     */
    _applyFallbackEnhancement: function(scoredBadges) {
        var self = this;
        return scoredBadges.map(function(badge) {
            var badgeData = badge.badge_data;
            
            badge.fallback_content = {
                linkedin_post: 'Proud to showcase my ' + badgeData.name + ' achievement! #ServiceNow #VeteranInTech #ProfessionalDevelopment',
                professional_summary: 'Demonstrated expertise in ' + (badgeData.category || 'ServiceNow platform'),
                confidence_score: 0.75,
                veteran_aligned: true,
                source: 'enhanced_fallback'
            };
            
            return badge;
        });
    },

    /**
     * Make actual API call to Manus.ai
     */
    _callManusAI: function(badgeData, context) {
        var startTime = new GlideDateTime().getNumericValue();
        
        try {
            this.httpClient.setEndpoint(this.API_BASE_URL + '/analyze-achievement');
            this.httpClient.setHttpMethod('POST');
            this.httpClient.setRequestHeader('Authorization', 'Bearer ' + this.API_KEY);
            this.httpClient.setRequestHeader('Content-Type', 'application/json');
            this.httpClient.setRequestHeader('X-SNAS-Client', 'ServiceNow-SNAS-v1.0');
            
            var payload = {
                badge: {
                    name: badgeData.name,
                    type: badgeData.type,
                    issuer: badgeData.issuer,
                    description: badgeData.description,
                    category: badgeData.category
                },
                context: {
                    target_audience: context.target_audience || 'it_recruiters',
                    veteran_narrative: true,
                    service_to_success_mission: true,
                    military_heritage: this.VETERAN_COLORS
                }
            };
            
            this.httpClient.setRequestBody(JSON.stringify(payload));
            
            var response = this.httpClient.execute();
            var responseBody = response.getBody();
            var statusCode = response.getStatusCode();
            
            var endTime = new GlideDateTime().getNumericValue();
            var responseTime = endTime - startTime;
            
            if (statusCode === 200 && responseBody) {
                var aiResponse = JSON.parse(responseBody);
                return {
                    linkedin_post: aiResponse.linkedin_post || this._generateFallbackLinkedInPost(badgeData),
                    professional_summary: aiResponse.summary || this._generateFallbackSummary(badgeData),
                    confidence_score: aiResponse.confidence || 0.85,
                    response_time_ms: responseTime,
                    api_source: 'manus_ai',
                    veteran_optimized: true
                };
            } else {
                throw new Error('API returned status ' + statusCode);
            }
            
        } catch (error) {
            gs.warn('SNAS AchievementAPI: Manus.ai API call failed: ' + error.message);
            return this._generateEnhancedFallbackContent(badgeData, context);
        }
    },

    /**
     * Generate enhanced fallback content
     */
    _generateEnhancedFallbackContent: function(badgeData, context) {
        return {
            linkedin_post: this._generateAdvancedLinkedInPost(badgeData, context),
            professional_summary: this._generateAdvancedSummary(badgeData, context),
            confidence_score: 0.78,
            response_time_ms: 50,
            api_source: 'enhanced_fallback',
            veteran_optimized: true
        };
    },

    /**
     * Generate advanced LinkedIn post with veteran narrative
     */
    _generateAdvancedLinkedInPost: function(badgeData, context) {
        var templates = {
            certification: "🎖️ Proud to earn my {name} certification! This achievement represents the same dedication to excellence I brought to military service, now applied to advancing ServiceNow expertise. Veterans bring unique discipline and problem-solving skills that drive technology innovation. #VeteranInTech #ServiceNow #ContinuousLearning #ServiceToSuccess",
            achievement: "🏆 Excited to share my latest {name} achievement! Military service taught me that excellence is a habit, not an act. Bringing that same commitment to technology leadership and ServiceNow platform mastery. #VeteranExcellence #TechLeadership #ServiceNow #ProfessionalGrowth",
            badge: "🌟 Just earned my {name} badge! The attention to detail and systematic approach developed in military service translates perfectly to ServiceNow platform expertise. Proud to showcase how veterans drive innovation in technology. #MilitaryToTech #ServiceNow #VeteranProfessionals"
        };
        
        var template = templates[badgeData.type] || templates.badge;
        return template.replace('{name}', badgeData.name);
    },

    /**
     * Generate advanced professional summary
     */
    _generateAdvancedSummary: function(badgeData, context) {
        return "ServiceNow professional with military background bringing " + 
               (badgeData.category || 'platform') + " expertise and leadership excellence. " +
               "The " + badgeData.name + " achievement demonstrates advanced proficiency in " +
               "ServiceNow capabilities, reflecting the discipline, attention to detail, and " +
               "commitment to excellence developed through military service. Veteran-driven " +
               "innovation in technology solutions with focus on mission success and team excellence.";
    },

    /**
     * Helper methods
     */
    _calculateDaysSince: function(dateEarned) {
        if (!dateEarned) return 999;
        try {
            var earnedDate = new GlideDate();
            earnedDate.setValue(dateEarned);
            var currentDate = new GlideDate();
            return currentDate.getNumericValue() - earnedDate.getNumericValue();
        } catch(e) {
            return 999;
        }
    },

    _calculateDisplayWeight: function(priorityScore) {
        if (priorityScore >= 100) return 'high';
        if (priorityScore >= 75) return 'medium';
        return 'low';
    },

    _predictEngagement: function(badge, priorityScore) {
        var baseEngagement = 0.6;
        var scoreModifier = (priorityScore - 50) / 100;
        return Math.min(0.95, Math.max(0.1, baseEngagement + scoreModifier));
    },

    _getCachedContent: function(cacheKey) {
        try {
            var cacheRecord = new GlideRecord('x_snc_snas_port_ai_cache');
            cacheRecord.addQuery('cache_key', cacheKey);
            cacheRecord.addQuery('expires_at', '>', new GlideDateTime().toString());
            cacheRecord.query();
            
            if (cacheRecord.next()) {
                return JSON.parse(cacheRecord.getValue('content'));
            }
        } catch (error) {
            gs.debug('SNAS AchievementAPI: Cache retrieval failed: ' + error.message);
        }
        return null;
    },

    _setCachedContent: function(cacheKey, content) {
        try {
            var expiresAt = new GlideDateTime();
            expiresAt.add(this.CACHE_DURATION_MS);
            
            var cacheRecord = new GlideRecord('x_snc_snas_port_ai_cache');
            cacheRecord.initialize();
            cacheRecord.setValue('cache_key', cacheKey);
            cacheRecord.setValue('content', JSON.stringify(content));
            cacheRecord.setValue('expires_at', expiresAt.toString());
            cacheRecord.insert();
        } catch (error) {
            gs.debug('SNAS AchievementAPI: Cache storage failed: ' + error.message);
        }
    },

    _isManusAIAvailable: function() {
        return this.API_KEY && this.API_KEY.length > 0;
    },

    _generateFallbackLinkedInPost: function(badgeData) {
        return "🏆 Proud to achieve " + badgeData.name + "! Military service taught me that " +
               "excellence is a daily commitment, not a one-time event. Bringing that same dedication " +
               "to ServiceNow platform mastery and veteran career advancement. #VeteranInTech #ServiceNow #Excellence";
    },

    _generateFallbackSummary: function(badgeData) {
        return "Accomplished " + badgeData.name + " professional with military background. " +
               "Demonstrates advanced ServiceNow platform capabilities combined with leadership " +
               "excellence and mission-focused problem solving developed through military service.";
    },

    _createErrorResponse: function(message, statusCode) {
        return {
            success: false,
            error: message,
            status_code: statusCode || 500,
            timestamp: new GlideDateTime().toString()
        };
    },

    type: 'AchievementAPI'
};
```

---

## 🔧 System Properties Configuration

After saving the AchievementAPI Script Include, create these System Properties:

Navigate to: **System Definition → System Properties**

Create the following properties (one by one):

### 1. Manus.ai API Base URL
```
Name: x_snc_snas_port.manus_ai_base_url
Type: String
Value: https://api.manus.ai/v1
Description: Manus.ai API base URL for AI badge prioritization
Scope: x_snc_snas_port
```

### 2. API Timeout
```
Name: x_snc_snas_port.api_timeout_ms
Type: Integer
Value: 1500
Description: API timeout in milliseconds (conservative for <2s SLA)
Scope: x_snc_snas_port
```

### 3. CSA Priority Boost
```
Name: x_snc_snas_port.csa_priority_boost
Type: Integer
Value: 25
Description: Priority boost for CSA certification (IT recruiter targeting)
Scope: x_snc_snas_port
```

### 4. Certification Boost
```
Name: x_snc_snas_port.certification_boost
Type: Integer
Value: 30
Description: Priority boost for certification type achievements
Scope: x_snc_snas_port
```

### 5. Recent Achievement Boost
```
Name: x_snc_snas_port.recent_achievement_boost
Type: Integer
Value: 20
Description: Priority boost for achievements earned within 90 days
Scope: x_snc_snas_port
```

### 6. Veteran Mission Enabled
```
Name: x_snc_snas_port.veteran_mission_enabled
Type: True/False
Value: true
Description: Enable veteran-focused mission branding
Scope: x_snc_snas_port
```

### 7. Veteran Brand Primary Color
```
Name: x_snc_snas_port.veteran_brand_primary
Type: String
Value: #1B365D
Description: Navy blue primary brand color (military heritage)
Scope: x_snc_snas_port
```

### 8. Veteran Brand Secondary Color
```
Name: x_snc_snas_port.veteran_brand_secondary
Type: String
Value: #FFD700
Description: Gold secondary brand color (military heritage)
Scope: x_snc_snas_port
```

### 9. Manus.ai API Key (Optional - Encrypted)
```
Name: x_snc_snas_port.manus_ai_api_key
Type: Password (Encrypted)
Value: [Leave blank for fallback mode]
Description: Encrypted Manus.ai API key for secure AI integration
Scope: x_snc_snas_port
Read Roles: x_snc_snas_port.admin
Write Roles: x_snc_snas_port.admin
```

---

## ✅ Quick Validation Script

After configuration, run this in **Background Scripts**:

```javascript
// Quick Validation
gs.info('=== SNAS Configuration Validation ===');

// 1. Check Script Include
try {
    var api = new AchievementAPI();
    gs.info('✓ AchievementAPI: OPERATIONAL');
    gs.info('  - CSA Boost: ' + api.CSA_PRIORITY_BOOST);
    gs.info('  - Cert Boost: ' + api.CERTIFICATION_BOOST);
    gs.info('  - Recent Boost: ' + api.RECENT_ACHIEVEMENT_BOOST);
    gs.info('  - SLA Target: ' + api.PERFORMANCE_SLA_MS + 'ms');
} catch(e) {
    gs.error('✗ AchievementAPI: FAILED - ' + e.message);
}

// 2. Check System Properties
var props = [
    'x_snc_snas_port.csa_priority_boost',
    'x_snc_snas_port.certification_boost',
    'x_snc_snas_port.recent_achievement_boost',
    'x_snc_snas_port.veteran_brand_primary',
    'x_snc_snas_port.veteran_brand_secondary'
];

props.forEach(function(prop) {
    var value = gs.getProperty(prop);
    gs.info((value ? '✓' : '✗') + ' ' + prop + ': ' + (value || 'MISSING'));
});

// 3. Test Algorithm
var testBadge = {
    id: 'test_csa',
    name: 'Certified System Administrator (CSA)',
    type: 'certification',
    issuer: 'ServiceNow',
    date_earned: '2024-08-15'
};

var result = api.prioritizeBadges({}, [testBadge], {target_audience: 'it_recruiters'});
gs.info('\n=== CSA Test Results ===');
gs.info('Score: ' + result.badges[0].priority_score + ' (Expected: 160+)');
gs.info('Processing Time: ' + result.processing_time_ms + 'ms (Target: <2000ms)');
gs.info('SLA Compliant: ' + result.metadata.sla_compliant);
```

**Expected Output**:
```
✓ AchievementAPI: OPERATIONAL
  - CSA Boost: 25
  - Cert Boost: 30
  - Recent Boost: 20
  - SLA Target: 2000ms
✓ x_snc_snas_port.csa_priority_boost: 25
✓ x_snc_snas_port.certification_boost: 30
✓ x_snc_snas_port.recent_achievement_boost: 20
✓ x_snc_snas_port.veteran_brand_primary: #1B365D
✓ x_snc_snas_port.veteran_brand_secondary: #FFD700

=== CSA Test Results ===
Score: 160 (Expected: 160+)
Processing Time: <1500ms (Target: <2000ms)
SLA Compliant: true
```

---

## 📝 Next Steps

1. **Save AchievementAPI Script Include** in ServiceNow Studio
2. **Create all 9 System Properties** as listed above
3. **Run validation script** to confirm setup
4. **Verify existing BadgeUtils and SNASRestAPI** Script Includes
5. **Check database table structures** match requirements
6. **Import badge data** (42 records)
7. **Execute Phase 2 validation**

---

**Version**: 1.0.0  
**Updated**: October 20, 2025  
**Instance**: dev231111.service-now.com  
**Status**: Ready to Deploy ✅
