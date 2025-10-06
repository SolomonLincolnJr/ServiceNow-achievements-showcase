/**
 * SNAS LinkedIn Export Flow - API Payload Builder Script
 * 
 * Flow Action 4: Build LinkedIn API Payload
 * Performance Target: <100ms execution time
 * 
 * Constructs properly formatted JSON payload for LinkedIn v2 shares API
 * with image support and military heritage content integration.
 */

(function execute(inputs, outputs) {
    'use strict';
    
    var startTime = new Date().getTime();
    
    try {
        // Input validation and sanitization
        var userSysId = inputs.user_sys_id || '';
        var badgeImage = inputs.badge_image || '';
        var linkedInContent = inputs.linkedin_content || '';
        var hashtags = inputs.hashtags || '';
        
        // Validate content length (LinkedIn limits)
        var maxContentLength = 1300; // LinkedIn character limit
        var fullContent = linkedInContent;
        
        if (hashtags && hashtags.trim().length > 0) {
            fullContent += '\\n\\n' + hashtags;
        }
        
        // Truncate if necessary while preserving hashtags
        if (fullContent.length > maxContentLength) {
            var availableLength = maxContentLength - hashtags.length - 4; // Account for \\n\\n
            linkedInContent = linkedInContent.substring(0, availableLength) + '...';
            fullContent = linkedInContent + '\\n\\n' + hashtags;
        }
        
        // Build LinkedIn API payload according to v2 specification
        var payload = {
            owner: 'urn:li:person:' + userSysId,
            text: {
                text: fullContent
            },
            distribution: {
                feedDistribution: 'MAIN_FEED',
                targetEntities: [],
                thirdPartyDistributionChannels: []
            },
            content: {},
            lifecycleState: 'PUBLISHED',
            isReshareDisabledByAuthor: false
        };
        
        // Add image content if badge image is provided
        if (badgeImage && badgeImage.trim().length > 0) {
            payload.content = {
                contentEntities: [{
                    entityLocation: badgeImage,
                    thumbnails: [{
                        imageSpecificContent: {},
                        resolvedUrl: badgeImage
                    }]
                }],
                title: 'SNAS Achievement Badge'
            };
        }
        
        // Add military heritage metadata
        payload.commentary = {
            text: fullContent,
            attributes: [{
                start: 0,
                length: fullContent.length,
                value: {
                    'com.linkedin.common.CompanyAttributedEntity': {
                        company: 'urn:li:organization:snas-veterans'
                    }
                }
            }]
        };
        
        // Convert to JSON string
        var jsonPayload = JSON.stringify(payload);
        var payloadSize = jsonPayload.length;
        
        // Validate payload size (LinkedIn API limits)
        var maxPayloadSize = 8192; // 8KB limit
        if (payloadSize > maxPayloadSize) {
            gs.warn('SNAS API Payload: Size exceeds recommended limit. Size: ' + payloadSize + ' bytes');
        }
        
        // Calculate execution time
        var endTime = new Date().getTime();
        var executionTime = endTime - startTime;
        
        // Set outputs
        outputs.api_payload = jsonPayload;
        outputs.payload_size_bytes = payloadSize;
        
        // Performance validation
        if (executionTime > 100) {
            gs.warn('SNAS Payload Builder: Exceeded 100ms target. Time: ' + executionTime + 'ms');
        }
        
        // Performance monitoring logging
        if (gs.getProperty('x_snc_snas_port.linkedin_performance_monitoring') === 'true') {
            gs.info('SNAS API Payload Built: ' + payloadSize + ' bytes (' + executionTime + 'ms)');
        }
        
        // Validate JSON structure
        try {
            JSON.parse(jsonPayload);
        } catch (parseError) {
            throw new Error('Invalid JSON payload generated: ' + parseError.toString());
        }
        
    } catch (error) {
        gs.error('SNAS Payload Builder Error: ' + error.toString());
        
        // Fallback minimal payload for reliability
        var fallbackPayload = {
            owner: 'urn:li:person:' + (inputs.user_sys_id || ''),
            text: {
                text: inputs.linkedin_content || 'SNAS Achievement shared via ServiceNow integration.'
            },
            distribution: {
                feedDistribution: 'MAIN_FEED'
            },
            lifecycleState: 'PUBLISHED'
        };
        
        outputs.api_payload = JSON.stringify(fallbackPayload);
        outputs.payload_size_bytes = outputs.api_payload.length;
        
        // Re-throw error for flow error handling
        throw error;
    }
    
})(inputs, outputs);