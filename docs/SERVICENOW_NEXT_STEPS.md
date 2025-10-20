# ServiceNow Implementation - Next Steps Guide

**Current Status**: You've created the AchievementAPI Script Include form in ServiceNow Studio  
**Instance**: dev231111.service-now.com  
**Next Action**: Complete the script configuration and continue implementation

---

## 🎯 IMMEDIATE NEXT STEPS

### ✅ Step 1: Complete AchievementAPI Script Include (You're Here!)

**What to do now**:

1. **In the ServiceNow Studio Script Include form**, you should see:
   - Name: `AchievementAPI`
   - API Name: `AchievementAPI` 
   - Active: ✅ Checked
   - Application: ServiceNow Achievements Showcase

2. **Copy the ENTIRE script** from: `docs/SERVICENOW_SCRIPT_PASTE.md`
   - The script starts with: `/**`
   - The script ends with: `type: 'AchievementAPI'`
   - Total lines: ~350 lines of code

3. **Paste into the "Script" field** (the large text area)

4. **Fill in Description**:
   ```
   AI-Powered Badge Prioritization Engine with Manus.ai Integration
   ```

5. **Click "Submit"** (or "Update" if updating existing)

**Expected Result**: ✅ AchievementAPI Script Include saved successfully

---

### Step 2: Create System Properties (10 minutes)

**Navigate to**: System Definition → System Properties

Or use **Filter Navigator** and type: `sys_properties.list`

#### Create Each Property (9 total):

**Property 1: Manus.ai Base URL**
```
Click "New" button
-----
Name: x_snc_snas_port.manus_ai_base_url
Type: String
Value: https://api.manus.ai/v1
Description: Manus.ai API base URL for AI badge prioritization
Scope: Select "x_snc_snas_port" from dropdown
-----
Click "Submit"
```

**Property 2: API Timeout**
```
Click "New" button
-----
Name: x_snc_snas_port.api_timeout_ms
Type: Integer
Value: 1500
Description: API timeout in milliseconds
Scope: x_snc_snas_port
-----
Click "Submit"
```

**Property 3: CSA Priority Boost** ⭐ CRITICAL
```
Click "New" button
-----
Name: x_snc_snas_port.csa_priority_boost
Type: Integer
Value: 25
Description: Priority boost for CSA certification
Scope: x_snc_snas_port
-----
Click "Submit"
```

**Property 4: Certification Boost** ⭐ CRITICAL
```
Click "New" button
-----
Name: x_snc_snas_port.certification_boost
Type: Integer
Value: 30
Description: Priority boost for certification type
Scope: x_snc_snas_port
-----
Click "Submit"
```

**Property 5: Recent Achievement Boost** ⭐ CRITICAL
```
Click "New" button
-----
Name: x_snc_snas_port.recent_achievement_boost
Type: Integer
Value: 20
Description: Priority boost for recent achievements
Scope: x_snc_snas_port
-----
Click "Submit"
```

**Property 6: Veteran Mission Enabled**
```
Click "New" button
-----
Name: x_snc_snas_port.veteran_mission_enabled
Type: True/False
Value: true
Description: Enable veteran mission branding
Scope: x_snc_snas_port
-----
Click "Submit"
```

**Property 7: Navy Color** 🎖️
```
Click "New" button
-----
Name: x_snc_snas_port.veteran_brand_primary
Type: String
Value: #1B365D
Description: Navy blue primary brand color
Scope: x_snc_snas_port
-----
Click "Submit"
```

**Property 8: Gold Color** 🎖️
```
Click "New" button
-----
Name: x_snc_snas_port.veteran_brand_secondary
Type: String
Value: #FFD700
Description: Gold secondary brand color
Scope: x_snc_snas_port
-----
Click "Submit"
```

**Property 9: Manus.ai API Key (Optional)**
```
Click "New" button
-----
Name: x_snc_snas_port.manus_ai_api_key
Type: Password (Encrypted)
Value: [Leave BLANK for now - fallback will activate]
Description: Manus.ai API key (optional - leave blank for fallback mode)
Scope: x_snc_snas_port
-----
Click "Submit"
```

**Expected Result**: ✅ 9 System Properties created

---

### Step 3: Validate Configuration (2 minutes)

**Navigate to**: System Definition → Scripts - Background

Or use **Filter Navigator**: `sys_script_background.do`

**Paste and Run this validation script**:

```javascript
// SNAS Configuration Validation Script
gs.info('╔════════════════════════════════════════════════════════╗');
gs.info('║     SNAS CONFIGURATION VALIDATION                      ║');
gs.info('╚════════════════════════════════════════════════════════╝');

// 1. Test AchievementAPI Script Include
gs.info('\n[1] Testing AchievementAPI Script Include...');
try {
    var api = new AchievementAPI();
    gs.info('✓ AchievementAPI: OPERATIONAL');
    gs.info('  - CSA Boost: ' + api.CSA_PRIORITY_BOOST + ' (Expected: 25)');
    gs.info('  - Certification Boost: ' + api.CERTIFICATION_BOOST + ' (Expected: 30)');
    gs.info('  - Recent Achievement Boost: ' + api.RECENT_ACHIEVEMENT_BOOST + ' (Expected: 20)');
    gs.info('  - Performance SLA: ' + api.PERFORMANCE_SLA_MS + 'ms (Expected: 2000ms)');
    gs.info('  - Navy Color: ' + api.VETERAN_COLORS.NAVY + ' (Expected: #1B365D)');
    gs.info('  - Gold Color: ' + api.VETERAN_COLORS.GOLD + ' (Expected: #FFD700)');
} catch(e) {
    gs.error('✗ AchievementAPI FAILED: ' + e.message);
    gs.error('  → Check that Script Include is saved properly');
}

// 2. Verify System Properties
gs.info('\n[2] Verifying System Properties...');
var props = {
    'CSA Boost': 'x_snc_snas_port.csa_priority_boost',
    'Cert Boost': 'x_snc_snas_port.certification_boost',
    'Recent Boost': 'x_snc_snas_port.recent_achievement_boost',
    'Navy Color': 'x_snc_snas_port.veteran_brand_primary',
    'Gold Color': 'x_snc_snas_port.veteran_brand_secondary',
    'Veteran Mission': 'x_snc_snas_port.veteran_mission_enabled',
    'API URL': 'x_snc_snas_port.manus_ai_base_url',
    'API Timeout': 'x_snc_snas_port.api_timeout_ms'
};

var allPropsOK = true;
for (var label in props) {
    var value = gs.getProperty(props[label]);
    if (value) {
        gs.info('✓ ' + label + ': ' + value);
    } else {
        gs.error('✗ ' + label + ': MISSING');
        allPropsOK = false;
    }
}

// 3. Test CSA Prioritization Algorithm
gs.info('\n[3] Testing CSA Prioritization Algorithm...');
try {
    var testBadge = {
        id: 'test_csa_001',
        name: 'Certified System Administrator (CSA)',
        type: 'certification',
        issuer: 'ServiceNow',
        category: 'Platform Administration',
        date_earned: '2024-08-15',
        description: 'CSA certification'
    };

    var userProfile = { name: 'Test User' };
    var context = { target_audience: 'it_recruiters' };

    var startTime = new GlideDateTime().getNumericValue();
    var result = api.prioritizeBadges(userProfile, [testBadge], context);
    var endTime = new GlideDateTime().getNumericValue();
    var totalTime = endTime - startTime;

    gs.info('✓ CSA Test Completed');
    gs.info('  - Priority Score: ' + result.badges[0].priority_score + ' (Expected: 160+)');
    gs.info('  - Processing Time: ' + result.processing_time_ms + 'ms (Target: <2000ms)');
    gs.info('  - Total Time: ' + totalTime + 'ms');
    gs.info('  - SLA Compliant: ' + result.metadata.sla_compliant);
    gs.info('  - Display Weight: ' + result.badges[0].display_weight + ' (Expected: high)');
    gs.info('  - Reasoning: ' + JSON.stringify(result.badges[0].reasoning));

    if (result.badges[0].priority_score >= 160 && result.metadata.sla_compliant) {
        gs.info('✓ CSA Algorithm: PASS ✅');
    } else {
        gs.warn('⚠ CSA Algorithm: Score or SLA issue');
    }
} catch(e) {
    gs.error('✗ CSA Test FAILED: ' + e.message);
}

// 4. Final Summary
gs.info('\n╔════════════════════════════════════════════════════════╗');
gs.info('║     VALIDATION SUMMARY                                 ║');
gs.info('╠════════════════════════════════════════════════════════╣');
if (allPropsOK) {
    gs.info('║  Configuration: ✅ COMPLETE                           ║');
    gs.info('║  Status: READY FOR DATA IMPORT                        ║');
} else {
    gs.info('║  Configuration: ⚠ INCOMPLETE                          ║');
    gs.info('║  Action: Create missing system properties            ║');
}
gs.info('╚════════════════════════════════════════════════════════╝');
```

**Click "Run script"**

**Expected Output**:
```
[1] Testing AchievementAPI Script Include...
✓ AchievementAPI: OPERATIONAL
  - CSA Boost: 25 (Expected: 25)
  - Certification Boost: 30 (Expected: 30)
  - Recent Achievement Boost: 20 (Expected: 20)
  - Performance SLA: 2000ms (Expected: 2000ms)
  - Navy Color: #1B365D (Expected: #1B365D)
  - Gold Color: #FFD700 (Expected: #FFD700)

[2] Verifying System Properties...
✓ CSA Boost: 25
✓ Cert Boost: 30
✓ Recent Boost: 20
✓ Navy Color: #1B365D
✓ Gold Color: #FFD700
✓ Veteran Mission: true
✓ API URL: https://api.manus.ai/v1
✓ API Timeout: 1500

[3] Testing CSA Prioritization Algorithm...
✓ CSA Test Completed
  - Priority Score: 160 (Expected: 160+)
  - Processing Time: <1500ms (Target: <2000ms)
  - SLA Compliant: true
  - Display Weight: high (Expected: high)
✓ CSA Algorithm: PASS ✅

VALIDATION SUMMARY
Configuration: ✅ COMPLETE
Status: READY FOR DATA IMPORT
```

**If you see ✅ PASS**: Configuration is perfect! Continue to Step 4.

**If you see ✗ FAIL**: 
- Check that AchievementAPI Script Include was saved
- Verify all 9 system properties were created
- Check property names for typos

---

### Step 4: Verify Existing Script Includes (2 minutes)

**In ServiceNow Studio**, check the other two Script Includes:

#### Check BadgeUtils:
1. Click on **Script Includes** in left panel
2. Find **BadgeUtils** (should show "Updated: 2025-10-02")
3. Click to open
4. Verify it contains badge utility functions
5. Look for methods like: `importBadgesFromCSV`, `generateBadgeStatistics`

#### Check SNASRestAPI:
1. In Script Includes list
2. Find **SNASRestAPI** (should show "Updated: 2025-10-02")
3. Click to open
4. Verify it contains REST API endpoint definitions
5. Look for methods related to badge prioritization

**Expected**: Both Script Includes should be present and configured.

---

### Step 5: Verify Database Tables (5 minutes)

**Check Achievement Table**:

1. Navigate to: **System Definition → Tables**
2. Search for: `x_snc_snas_port_achievement` or just search "SNAS"
3. Click on the table
4. Verify these fields exist:
   - name (String)
   - type (Choice: certification/achievement/badge)
   - issuer (String)
   - description (String/HTML)
   - category (String)
   - date_earned (Date)
   - active (Boolean)

**Check SNAS Achievements Table**:
1. Search for the second table
2. Verify similar structure exists

**If tables are missing fields**:
- Note which fields are missing
- We'll add them in the next step

---

### Step 6: Import Sample Badge Data (5 minutes)

**Navigate to**: Scripts - Background (`sys_script_background.do`)

**Paste and run this import script**:

```javascript
// BADGE DATA IMPORT SCRIPT
gs.info('╔════════════════════════════════════════════════════════╗');
gs.info('║     BADGE DATA IMPORT                                  ║');
gs.info('╚════════════════════════════════════════════════════════╝');

// Sample test badges for validation
var sampleBadges = [
    {
        name: 'Certified System Administrator (CSA)',
        type: 'certification',
        issuer: 'ServiceNow',
        description: 'Comprehensive ServiceNow platform administration certification demonstrating expertise in system configuration.',
        category: 'Platform Administration',
        date_earned: '2024-08-15',
        active: true
    },
    {
        name: 'Certified Implementation Specialist - ITSM',
        type: 'certification',
        issuer: 'ServiceNow',
        description: 'Advanced ITSM implementation certification covering incident, problem, and change management.',
        category: 'ITSM Implementation',
        date_earned: '2024-07-22',
        active: true
    },
    {
        name: 'RiseUp Achievement Badge',
        type: 'achievement',
        issuer: 'ServiceNow',
        description: 'Recognition for outstanding contribution to diversity and inclusion in technology.',
        category: 'Community Impact',
        date_earned: '2024-09-10',
        active: true
    },
    {
        name: 'Military Leadership Excellence',
        type: 'achievement',
        issuer: 'U.S. Navy',
        description: 'Demonstrated exceptional leadership capabilities in high-pressure military environments.',
        category: 'Leadership',
        date_earned: '2020-03-15',
        active: true
    },
    {
        name: 'Veteran Technology Leadership',
        type: 'achievement',
        issuer: 'Veterans in Technology',
        description: 'Recognition for mentoring fellow veterans in technology careers.',
        category: 'Veteran Advocacy',
        date_earned: '2024-08-01',
        active: true
    }
];

// Import badges
var imported = 0;
var errors = [];

sampleBadges.forEach(function(badge) {
    try {
        var gr = new GlideRecord('x_snc_snas_port_achievement');
        gr.initialize();
        gr.setValue('name', badge.name);
        gr.setValue('type', badge.type);
        gr.setValue('issuer', badge.issuer);
        gr.setValue('description', badge.description);
        gr.setValue('category', badge.category);
        gr.setValue('date_earned', badge.date_earned);
        gr.setValue('active', badge.active);
        
        if (gr.insert()) {
            imported++;
            gs.info('✓ Imported: ' + badge.name);
        } else {
            errors.push('Failed to insert: ' + badge.name);
        }
    } catch(e) {
        errors.push(badge.name + ': ' + e.message);
        gs.error('✗ Error importing ' + badge.name + ': ' + e.message);
    }
});

// Summary
gs.info('\n╔════════════════════════════════════════════════════════╗');
gs.info('║     IMPORT SUMMARY                                     ║');
gs.info('╠════════════════════════════════════════════════════════╣');
gs.info('║  Imported: ' + imported + '/' + sampleBadges.length + ' badges                            ║');
if (errors.length > 0) {
    gs.info('║  Errors: ' + errors.length + '                                         ║');
    gs.info('╠════════════════════════════════════════════════════════╣');
    errors.forEach(function(err) {
        gs.error('  - ' + err);
    });
}
gs.info('╚════════════════════════════════════════════════════════╝');

// Verify count
var gr = new GlideRecord('x_snc_snas_port_achievement');
gr.addActiveQuery();
gr.query();
var totalCount = gr.getRowCount();
gs.info('\nTotal Active Badges in System: ' + totalCount);
```

**Expected Output**:
```
✓ Imported: Certified System Administrator (CSA)
✓ Imported: Certified Implementation Specialist - ITSM
✓ Imported: RiseUp Achievement Badge
✓ Imported: Military Leadership Excellence
✓ Imported: Veteran Technology Leadership

IMPORT SUMMARY
Imported: 5/5 badges

Total Active Badges in System: 5
```

---

### Step 7: Test Full Badge Prioritization (2 minutes)

**Run this comprehensive test**:

```javascript
// COMPREHENSIVE BADGE PRIORITIZATION TEST
gs.info('╔════════════════════════════════════════════════════════╗');
gs.info('║     BADGE PRIORITIZATION TEST                          ║');
gs.info('╚════════════════════════════════════════════════════════╝');

var api = new AchievementAPI();

// Load all badges from database
var badgeGR = new GlideRecord('x_snc_snas_port_achievement');
badgeGR.addActiveQuery();
badgeGR.query();

var badges = [];
while (badgeGR.next()) {
    badges.push({
        id: badgeGR.getUniqueValue(),
        name: badgeGR.getValue('name'),
        type: badgeGR.getValue('type'),
        issuer: badgeGR.getValue('issuer'),
        category: badgeGR.getValue('category'),
        date_earned: badgeGR.getValue('date_earned'),
        description: badgeGR.getValue('description')
    });
}

gs.info('Testing with ' + badges.length + ' badges from database...\n');

// Test prioritization
var startTime = new GlideDateTime().getNumericValue();
var result = api.prioritizeBadges(
    { name: 'Solomon Washington' },
    badges,
    { target_audience: 'it_recruiters' }
);
var endTime = new GlideDateTime().getNumericValue();
var totalTime = endTime - startTime;

// Display results
gs.info('Processing Time: ' + result.processing_time_ms + 'ms');
gs.info('Total Execution Time: ' + totalTime + 'ms');
gs.info('SLA Compliant: ' + (totalTime < 2000 ? '✅ YES' : '✗ NO'));
gs.info('Badge Count: ' + result.badges.length);

gs.info('\n Top 5 Prioritized Badges:');
for (var i = 0; i < Math.min(5, result.badges.length); i++) {
    var badge = result.badges[i];
    gs.info((i+1) + '. ' + badge.badge_data.name);
    gs.info('   Score: ' + badge.priority_score + ' | Weight: ' + badge.display_weight);
    gs.info('   Reasoning: ' + badge.reasoning.join(', '));
}

gs.info('\n╔════════════════════════════════════════════════════════╗');
gs.info('║     TEST RESULT: ' + (totalTime < 2000 && result.success ? '✅ PASS' : '✗ FAIL') + '                            ║');
gs.info('╚════════════════════════════════════════════════════════╝');
```

**Expected Output**:
```
Testing with 5 badges from database...

Processing Time: <1500ms
Total Execution Time: <1500ms
SLA Compliant: ✅ YES
Badge Count: 5

Top 5 Prioritized Badges:
1. Certified System Administrator (CSA)
   Score: 160 | Weight: high
   Reasoning: CSA certification priority boost (+25), Certification type boost (+30), ServiceNow platform relevance (+15), Recent achievement boost (+20), Audience targeting boost (+20)

2. Certified Implementation Specialist - ITSM
   Score: 145 | Weight: high
   Reasoning: Certification type boost (+30), ServiceNow platform relevance (+15), Recent achievement boost (+20)

[... etc ...]

TEST RESULT: ✅ PASS
```

---

## 🎯 SUCCESS CRITERIA CHECKLIST

```
Configuration Complete When:

□ AchievementAPI Script Include saved
□ All 9 system properties created
□ Validation script passes all tests
□ CSA gets 160+ priority score
□ Processing time < 2000ms
□ BadgeUtils Script Include exists
□ SNASRestAPI Script Include exists
□ Database tables have correct fields
□ Sample badge data imported successfully
□ Full prioritization test passes

Current Progress: ___/10 complete
```

---

## 🚨 Troubleshooting

### Issue: "AchievementAPI is not defined"
**Fix**: Script Include not saved properly. Re-paste and submit.

### Issue: System Properties not found
**Fix**: Verify exact property names match (case-sensitive). Check scope is `x_snc_snas_port`.

### Issue: CSA Score is wrong
**Fix**: Check that all three boosts are configured (CSA: 25, Cert: 30, Recent: 20).

### Issue: Performance > 2000ms
**Fix**: Reduce test badge count or clear application cache.

---

## 📞 Need Help?

Refer to detailed guides:
- **Full Implementation**: `docs/SERVICENOW_IMPLEMENTATION_GUIDE.md`
- **Quick Reference**: `docs/SERVICENOW_QUICK_REFERENCE.md`
- **Script Content**: `docs/SERVICENOW_SCRIPT_PASTE.md`

---

**Next Step After Completion**: Import full badge dataset (42 records) and accolade data (41 records)

**Status**: Configuration Phase  
**Target**: Phase 2 Validation Complete  
**Confidence**: VERY HIGH ⭐⭐⭐⭐⭐
