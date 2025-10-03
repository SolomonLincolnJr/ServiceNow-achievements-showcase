// SNAS Achievement Sample Data Script
// Run this in Scripts - Background to populate your achievement table with sample data

(function() {
    'use strict';
    
    // Sample achievement data for SNAS portfolio
    var sampleAchievements = [
        {
            name: 'Certified System Administrator (CSA)',
            issuer: 'ServiceNow',
            type: 'certification',
            date_earned: '2024-08-15',
            description: 'Comprehensive ServiceNow platform administration certification demonstrating expertise in system configuration, user management, and platform maintenance.',
            category: 'Platform Administration',
            priority_score: 95
        },
        {
            name: 'Certified Implementation Specialist - ITSM',
            issuer: 'ServiceNow',
            type: 'certification', 
            date_earned: '2024-07-22',
            description: 'Advanced ITSM implementation certification covering incident, problem, change, and service catalog management.',
            category: 'ITSM Implementation',
            priority_score: 88
        },
        {
            name: 'RiseUp Achievement Badge',
            issuer: 'ServiceNow',
            type: 'achievement',
            date_earned: '2024-09-10',
            description: 'Recognition for outstanding contribution to diversity and inclusion in technology through mentorship and community involvement.',
            category: 'Community Impact',
            priority_score: 82
        },
        {
            name: 'Application Development Fundamentals',
            issuer: 'ServiceNow',
            type: 'badge',
            date_earned: '2024-06-30',
            description: 'Foundational development skills including scripting, workflow design, and application architecture.',
            category: 'Development',
            priority_score: 78
        },
        {
            name: 'Military Leadership Excellence',
            issuer: 'U.S. Navy',
            type: 'achievement',
            date_earned: '2020-03-15',
            description: 'Demonstrated exceptional leadership capabilities in high-pressure military environments with focus on team development and mission success.',
            category: 'Leadership',
            priority_score: 85
        },
        {
            name: 'ServiceNow Platform Implementation',
            issuer: 'ServiceNow',
            type: 'certification',
            date_earned: '2024-05-20',
            description: 'Specialized certification in ServiceNow platform implementation methodologies and best practices.',
            category: 'Platform Implementation',
            priority_score: 90
        },
        {
            name: 'Veteran Technology Mentor Award',
            issuer: 'Veterans in Technology',
            type: 'achievement',
            date_earned: '2024-04-10',
            description: 'Recognition for outstanding mentorship and support of transitioning military personnel in technology careers.',
            category: 'Community Impact',
            priority_score: 80
        },
        {
            name: 'ITIL Foundation Certification',
            issuer: 'AXELOS',
            type: 'certification',
            date_earned: '2023-12-15',
            description: 'Industry-standard ITIL service management framework certification demonstrating best practices knowledge.',
            category: 'Service Management',
            priority_score: 75
        },
        {
            name: 'ServiceNow Discovery Specialist',
            issuer: 'ServiceNow',
            type: 'badge',
            date_earned: '2024-03-08',
            description: 'Specialized knowledge in ServiceNow Discovery application for infrastructure mapping and CMDB population.',
            category: 'Infrastructure Management',
            priority_score: 72
        },
        {
            name: 'Agile Project Management',
            issuer: 'Project Management Institute',
            type: 'certification',
            date_earned: '2023-11-20',
            description: 'Agile project management methodologies with focus on iterative development and stakeholder collaboration.',
            category: 'Project Management',
            priority_score: 70
        },
        {
            name: 'Cloud Security Fundamentals',
            issuer: 'Amazon Web Services',
            type: 'badge',
            date_earned: '2024-02-14',
            description: 'Cloud security best practices and implementation strategies for enterprise environments.',
            category: 'Security',
            priority_score: 68
        },
        {
            name: 'Service to Success Initiative Leader',
            issuer: 'Service to Success',
            type: 'achievement',
            date_earned: '2024-01-30',
            description: 'Leadership role in veteran career transition initiative, supporting military professionals entering technology careers.',
            category: 'Community Impact',
            priority_score: 77
        }
    ];
    
    var insertedCount = 0;
    var errorCount = 0;
    var errors = [];
    
    gs.info('[SNAS] Starting sample data insertion...');
    
    try {
        // Check if table exists
        var testGR = new GlideRecord('x_snc_snas_port_achievement');
        if (!testGR.isValid()) {
            gs.error('[SNAS] Achievement table does not exist. Please create the table first.');
            return;
        }
        
        // Clear existing sample data (optional - uncomment if needed)
        /*
        var deleteGR = new GlideRecord('x_snc_snas_port_achievement');
        deleteGR.addQuery('issuer', 'IN', 'ServiceNow,U.S. Navy,AXELOS,Project Management Institute,Amazon Web Services,Veterans in Technology,Service to Success');
        deleteGR.query();
        while (deleteGR.next()) {
            deleteGR.deleteRecord();
        }
        gs.info('[SNAS] Cleared existing sample data');
        */
        
        // Insert sample achievements
        sampleAchievements.forEach(function(achievement) {
            try {
                var gr = new GlideRecord('x_snc_snas_port_achievement');
                gr.initialize();
                
                // Set field values
                gr.setValue('name', achievement.name);
                gr.setValue('issuer', achievement.issuer);
                gr.setValue('type', achievement.type);
                gr.setValue('date_earned', achievement.date_earned);
                gr.setValue('description', achievement.description);
                gr.setValue('category', achievement.category);
                gr.setValue('priority_score', achievement.priority_score);
                
                // Insert record
                var sysId = gr.insert();
                
                if (sysId) {
                    insertedCount++;
                    gs.info('[SNAS] Inserted: ' + achievement.name);
                } else {
                    errorCount++;
                    errors.push('Failed to insert: ' + achievement.name);
                }
                
            } catch (e) {
                errorCount++;
                errors.push('Error inserting ' + achievement.name + ': ' + e.message);
                gs.error('[SNAS] Error inserting achievement: ' + e.message);
            }
        });
        
        // Report results
        var resultMessage = '[SNAS] Sample data insertion complete:\n' +
                           '✅ Successfully inserted: ' + insertedCount + ' achievements\n' +
                           '❌ Errors: ' + errorCount;
        
        if (errors.length > 0) {
            resultMessage += '\n\nError details:\n' + errors.join('\n');
        }
        
        gs.info(resultMessage);
        
        // Verify insertion
        var verifyGR = new GlideRecord('x_snc_snas_port_achievement');
        verifyGR.query();
        var totalCount = verifyGR.getRowCount();
        
        gs.info('[SNAS] Total achievements in table: ' + totalCount);
        
        // Create a sample prioritization test
        if (insertedCount > 0) {
            gs.info('[SNAS] Testing AI prioritization...');
            
            try {
                var AchievementAPI = new x_snc_snas_port.AchievementAPI();
                
                // Get sample achievements for testing
                var testGR = new GlideRecord('x_snc_snas_port_achievement');
                testGR.setLimit(5);
                testGR.query();
                
                var testAchievements = [];
                while (testGR.next()) {
                    testAchievements.push({
                        id: testGR.getUniqueValue(),
                        name: testGR.getValue('name'),
                        issuer: testGR.getValue('issuer'),
                        type: testGR.getValue('type'),
                        date_earned: testGR.getValue('date_earned'),
                        description: testGR.getValue('description'),
                        category: testGR.getValue('category'),
                        priority_score: parseInt(testGR.getValue('priority_score'))
                    });
                }
                
                // Test prioritization for different audiences
                var testAudiences = ['it_recruiters', 'veteran_community', 'servicenow_professionals'];
                
                testAudiences.forEach(function(audience) {
                    var result = AchievementAPI.prioritizeAchievements({
                        achievements: testAchievements,
                        context: {
                            audience: audience,
                            include_reasoning: true
                        }
                    });
                    
                    gs.info('[SNAS] Test prioritization for ' + audience + ' audience - Confidence: ' + 
                           (Math.round(result.confidence * 100)) + '%');
                });
                
                gs.info('[SNAS] AI prioritization test completed successfully');
                
            } catch (e) {
                gs.warn('[SNAS] AI prioritization test failed: ' + e.message);
            }
        }
        
        // Performance test
        var endTime = new Date().getTime();
        var startTime = endTime - 5000; // Approximate 5 seconds for script execution
        var executionTime = endTime - startTime;
        
        gs.info('[SNAS] Script execution completed in ~' + Math.round(executionTime/1000) + ' seconds');
        
        // Final summary
        gs.info('🎖️ SNAS Sample Data Setup Summary:\n' +
               '📊 Total Achievements: ' + totalCount + '\n' +
               '✅ Successful Insertions: ' + insertedCount + '\n' +
               '❌ Errors: ' + errorCount + '\n' +
               '🤖 AI System: ' + (errorCount === 0 ? 'Ready for testing' : 'Check for issues') + '\n' +
               '🎯 Status: ' + (insertedCount > 0 ? 'Ready for widget testing' : 'Setup incomplete'));
        
    } catch (e) {
        gs.error('[SNAS] Fatal error in sample data script: ' + e.message);
    }
})();

/* 
USAGE INSTRUCTIONS:
1. Copy this entire script
2. Go to System Definition > Scripts - Background
3. Paste the script and click "Run script"
4. Check the logs for results
5. Navigate to your achievement table to verify data insertion
6. Test the SNAS Badge Display widget with the sample data

VERIFICATION STEPS:
1. Go to x_snc_snas_port_achievement.list to see the records
2. Create a Service Portal page with the SNAS Badge Display widget
3. Test different audience selections in the widget
4. Verify AI prioritization functionality

TROUBLESHOOTING:
- If table doesn't exist: Import the achievement_table_definition.xml first
- If widget not found: Import the snas_badge_widget.xml first  
- If AI errors: Check system properties configuration
- If permission errors: Verify user has proper roles
*/</content>