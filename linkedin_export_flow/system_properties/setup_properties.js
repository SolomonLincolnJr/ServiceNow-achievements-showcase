/**
 * SNAS LinkedIn Export Flow - System Properties Setup Script
 * 
 * Execute this script to create all required system properties for LinkedIn integration
 * Run in ServiceNow Background Scripts with scope = x_snc_snas_port
 * 
 * This script creates encrypted and standard properties with proper access controls
 * Performance target: <100ms execution time
 */

(function setupLinkedInProperties() {
    'use strict';
    
    var startTime = new Date().getTime();
    
    // Verify scope
    var currentScope = gs.getCurrentApplicationId();
    var targetScope = 'f487471a839832102c9c95d0deaad325'; // x_snc_snas_port
    
    if (currentScope !== targetScope) {
        gs.error('Script must be executed in x_snc_snas_port scope. Current: ' + currentScope);
        return false;
    }
    
    gs.info('Setting up SNAS LinkedIn properties in scope: ' + currentScope);
    
    // Property definitions
    var properties = [
        {
            name: 'x_snc_snas_port.linkedin_api_endpoint',
            value: 'https://api.linkedin.com/v2/shares',
            type: 'string',
            description: 'LinkedIn API endpoint for sharing posts via SNAS export flow. Production endpoint for LinkedIn v2 shares API.',
            isPrivate: false
        },
        {
            name: 'x_snc_snas_port.linkedin_oauth_token',
            value: '', // Empty for security - to be set manually
            type: 'password',
            description: 'LinkedIn OAuth access token for SNAS export flow API authentication. ENCRYPTED - Stores bearer token securely.',
            isPrivate: true
        },
        {
            name: 'x_snc_snas_port.linkedin_mock_mode',
            value: 'true',
            type: 'boolean',
            description: 'Enable mock mode for LinkedIn API during development and testing. When true, uses mock responses.',
            isPrivate: false
        },
        {
            name: 'x_snc_snas_port.linkedin_mock_endpoint',
            value: 'https://httpbin.org/post',
            type: 'string',
            description: 'Mock LinkedIn API endpoint for testing SNAS export flow without actual LinkedIn integration.',
            isPrivate: false
        },
        {
            name: 'x_snc_snas_port.linkedin_timeout_ms',
            value: '5000',
            type: 'integer',
            description: 'REST call timeout in milliseconds for LinkedIn API requests. Default 5000ms to meet SLA requirements.',
            isPrivate: false
        },
        {
            name: 'x_snc_snas_port.linkedin_max_retries',
            value: '2',
            type: 'integer',
            description: 'Maximum number of retry attempts for failed LinkedIn API calls. Implements exponential backoff.',
            isPrivate: false
        },
        {
            name: 'x_snc_snas_port.linkedin_retry_delay_ms',
            value: '500',
            type: 'integer',
            description: 'Retry delay in milliseconds for LinkedIn API failures. Base delay for exponential backoff.',
            isPrivate: false
        },
        {
            name: 'x_snc_snas_port.linkedin_performance_monitoring',
            value: 'true',
            type: 'boolean',
            description: 'Enable performance monitoring and SLA tracking for SNAS LinkedIn export operations.',
            isPrivate: false
        },
        {
            name: 'x_snc_snas_port.brand_color_navy',
            value: '#1B365D',
            type: 'string',
            description: 'SNAS branding primary color (Navy) for UI components and notifications.',
            isPrivate: false
        },
        {
            name: 'x_snc_snas_port.brand_color_gold',
            value: '#FFD700',
            type: 'string',
            description: 'SNAS branding accent color (Gold) for highlights and interactive elements.',
            isPrivate: false
        }
    ];
    
    var createdCount = 0;
    var updatedCount = 0;
    var errorCount = 0;
    
    // Create or update each property
    properties.forEach(function(prop) {
        try {
            var gr = new GlideRecord('sys_properties');
            gr.addQuery('name', prop.name);
            gr.query();
            
            var isUpdate = false;
            if (gr.next()) {
                isUpdate = true;
                gs.info('Updating existing property: ' + prop.name);
            } else {
                gr.initialize();
                gr.name = prop.name;
                gs.info('Creating new property: ' + prop.name);
            }
            
            // Set property values
            gr.value = prop.value;
            gr.type = prop.type;
            gr.description = prop.description;
            gr.is_private = prop.isPrivate;
            
            // Set access controls for SNAS scope
            gr.write_roles = 'admin,x_snc_snas_port.admin';
            if (!prop.isPrivate) {
                gr.read_roles = '';
            } else {
                gr.read_roles = 'admin,x_snc_snas_port.admin';
            }
            
            if (isUpdate) {
                gr.update();
                updatedCount++;
            } else {
                gr.insert();
                createdCount++;
            }
            
            gs.info('✅ ' + (isUpdate ? 'Updated' : 'Created') + ' property: ' + prop.name + ' = ' + 
                   (prop.isPrivate ? '[ENCRYPTED]' : prop.value));
            
        } catch (error) {
            gs.error('❌ Error processing property ' + prop.name + ': ' + error.toString());
            errorCount++;
        }
    });
    
    // Validate property access
    gs.info('Validating property access...');
    var testProperty = gs.getProperty('x_snc_snas_port.linkedin_mock_mode');
    var brandNavy = gs.getProperty('x_snc_snas_port.brand_color_navy');
    var brandGold = gs.getProperty('x_snc_snas_port.brand_color_gold');
    
    // Performance calculation
    var endTime = new Date().getTime();
    var executionTime = endTime - startTime;
    
    // Results summary
    gs.info('📊 SNAS LinkedIn Properties Setup Summary:');
    gs.info('  - Properties created: ' + createdCount);
    gs.info('  - Properties updated: ' + updatedCount);
    gs.info('  - Errors encountered: ' + errorCount);
    gs.info('  - Total properties: ' + properties.length);
    gs.info('  - Execution time: ' + executionTime + 'ms');
    gs.info('');
    gs.info('🎖️ SNAS Branding Validation:');
    gs.info('  - Navy color: ' + brandNavy + ' (Primary)');
    gs.info('  - Gold color: ' + brandGold + ' (Accent)');
    gs.info('  - Mock mode: ' + testProperty);
    gs.info('');
    gs.info('🚀 LinkedIn Integration Properties Ready!');
    gs.info('⚡ Performance: Setup completed in ' + executionTime + 'ms (Target: <100ms)');
    
    if (executionTime > 100) {
        gs.warn('⚠️ Performance warning: Setup exceeded 100ms target');
    }
    
    if (errorCount === 0) {
        gs.info('✅ All properties configured successfully for LinkedIn Export Flow');
        return true;
    } else {
        gs.error('❌ Setup completed with ' + errorCount + ' errors. Review logs above.');
        return false;
    }
})();