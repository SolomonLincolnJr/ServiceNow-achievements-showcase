/**
 * SNAS LinkedIn Export Flow - AI Content Generation Script
 * 
 * Flow Action 3: Generate Military-Heritage AI Content
 * Performance Target: <200ms execution time
 * 
 * Generates LinkedIn post content with military heritage messaging
 * and Service-to-Success themes for veteran professional advancement.
 */

(function execute(inputs, outputs) {
    'use strict';
    
    var startTime = new Date().getTime();
    
    try {
        // Input validation
        var achievementTitle = inputs.achievement_title || 'Professional Achievement';
        var achievementDescription = inputs.achievement_description || '';
        var userName = inputs.user_name || 'SNAS Professional';
        var category = inputs.category || 'Professional';
        var priorityScore = parseInt(inputs.priority_score) || 50;
        
        // Military heritage content templates by category
        var contentTemplates = {
            'ServiceNow': {
                opening: '🎖️ Another milestone in my Service-to-Success journey!',
                middle: 'Military discipline meets cutting-edge technology as I continue advancing in the ServiceNow ecosystem.',
                hashtags: '#ServiceNow #VeteranInTech #CSA #MilitaryLeadership #ServiceToSuccess'
            },
            'Military': {
                opening: '🇺🇸 Honored to share this recognition of service and leadership!',
                middle: 'Continuing the mission of excellence - from military service to technology innovation, the values remain the same.',
                hashtags: '#VeteranLeadership #MilitaryExcellence #ServiceToSuccess #VeteransInTech #Leadership'
            },
            'Certification': {
                opening: '📜 Proud to announce another certification milestone!',
                middle: 'The discipline and attention to detail from military service continues to drive professional excellence.',
                hashtags: '#ProfessionalDevelopment #VeteranInTech #ContinuousLearning #MilitaryPrecision #ServiceToSuccess'
            },
            'Community': {
                opening: '🤝 Giving back to the community that shaped my values!',
                middle: 'Service doesn\'t end with uniform - it evolves. Proud to support fellow veterans in their technology careers.',
                hashtags: '#CommunityService #VeteranSupport #MentoringMatters #ServiceToSuccess #VeteransHelping'
            }
        };
        
        // Select appropriate template
        var template = contentTemplates[category] || contentTemplates['ServiceNow'];
        
        // Generate priority-based content enhancements
        var priorityEnhancements = {
            high: priorityScore >= 90 ? '💪 This achievement represents exceptional dedication and the highest standards of excellence.' : '',
            medium: priorityScore >= 70 ? '⚡ Continuing to push boundaries and set new standards.' : '',
            low: priorityScore >= 50 ? '🚀 Every step forward counts in the journey of continuous improvement.' : ''
        };
        
        var enhancement = '';
        if (priorityScore >= 90) enhancement = priorityEnhancements.high;
        else if (priorityScore >= 70) enhancement = priorityEnhancements.medium;
        else enhancement = priorityEnhancements.low;
        
        // Build the LinkedIn content
        var linkedInContent = template.opening + '\\n\\n';
        linkedInContent += 'Just earned: ' + achievementTitle + '\\n\\n';
        
        if (achievementDescription && achievementDescription.length > 0) {
            // Extract key points from description (limit to prevent length issues)
            var descriptionSummary = achievementDescription.length > 100 ? 
                achievementDescription.substring(0, 100) + '...' : achievementDescription;
            linkedInContent += descriptionSummary + '\\n\\n';
        }
        
        linkedInContent += template.middle + '\\n\\n';
        
        if (enhancement) {
            linkedInContent += enhancement + '\\n\\n';
        }
        
        // Add military-themed closing
        var closings = [
            '💼 Open to new opportunities where military leadership meets technology innovation.',
            '🎯 Ready to bring military precision to your next technology challenge.',
            '⚡ Transforming military excellence into technology leadership.',
            '🌟 From service member to technology leader - the mission continues.'
        ];
        
        var randomClosing = closings[Math.floor(Math.random() * closings.length)];
        linkedInContent += randomClosing;
        
        // Prepare hashtags
        var baseHashtags = template.hashtags;
        
        // Add special hashtags for high-priority achievements
        if (priorityScore >= 95) {
            baseHashtags += ' #Excellence #Leadership';
        }
        
        if (achievementTitle.toLowerCase().includes('csa')) {
            baseHashtags += ' #CSA #ServiceNowCertified';
        }
        
        // Calculate execution time
        var endTime = new Date().getTime();
        var executionTime = endTime - startTime;
        
        // Set outputs
        outputs.linkedin_content = linkedInContent;
        outputs.hashtags = baseHashtags;
        outputs.generation_time_ms = executionTime;
        
        // Performance validation
        if (executionTime > 200) {
            gs.warn('SNAS Content Generation: Exceeded 200ms target. Time: ' + executionTime + 'ms');
        }
        
        // Logging for performance monitoring
        if (gs.getProperty('x_snc_snas_port.linkedin_performance_monitoring') === 'true') {
            gs.info('SNAS AI Content Generated: ' + achievementTitle + ' (' + executionTime + 'ms)');
        }
        
    } catch (error) {
        gs.error('SNAS Content Generation Error: ' + error.toString());
        
        // Fallback content for reliability
        outputs.linkedin_content = '🎖️ Proud to share another achievement in my professional journey!\\n\\n' +
                                 'Just earned: ' + (inputs.achievement_title || 'Professional Achievement') + '\\n\\n' +
                                 'Military discipline meets technology innovation.\\n\\n' +
                                 '#VeteranInTech #ServiceToSuccess #ProfessionalExcellence';
        outputs.hashtags = '#VeteranInTech #ServiceToSuccess #ProfessionalExcellence';
        outputs.generation_time_ms = new Date().getTime() - startTime;
    }
    
})(inputs, outputs);