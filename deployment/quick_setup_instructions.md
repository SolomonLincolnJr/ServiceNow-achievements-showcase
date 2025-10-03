# 🚀 SNAS ServiceNow Quick Setup Instructions

## Your ServiceNow Instance Details
- **Instance URL:** https://dev231111.service-now.com/
- **Username:** admin  
- **Password:** Il^6ceC1@RaG
- **Studio URL:** https://dev231111.service-now.com/now/servicenow-studio/

## 🎯 5-Step Quick Setup

### Step 1: Import Application Scope (5 minutes)

1. **Login to ServiceNow Studio:**
   ```
   URL: https://dev231111.service-now.com/now/servicenow-studio/
   ```

2. **Create New Application:**
   - Click **"Create Application"**
   - **Name:** ServiceNow Achievements Showcase (SNAS)
   - **Scope:** x_snc_snas_port
   - Click **Create**

### Step 2: Create Achievement Table (3 minutes)

1. **In Studio, right-click on "Tables"**
2. **Select "Create Table"**
3. **Table Details:**
   - **Label:** Achievement
   - **Name:** achievement (will become x_snc_snas_port_achievement)
   - **Auto number:** Leave unchecked
   - **Extensible:** Leave unchecked
4. **Add these fields by clicking "New" in the Fields tab:**
   
   | Field Name | Type | Max Length | Mandatory |
   |------------|------|------------|-----------|
   | name | String | 100 | ✓ |
   | issuer | String | 50 | ✓ |
   | type | Choice | 20 | ✓ |
   | date_earned | Date | - | - |
   | description | String | 1000 | - |
   | category | String | 50 | - |
   | priority_score | Integer | - | - |
   | ai_reasoning | String | 500 | - |

5. **For the "type" field, add these choices:**
   - certification
   - achievement  
   - badge

### Step 3: Import Widget (2 minutes)

1. **Go to System Import Sets > Load Data**
2. **Upload:** `snas_badge_widget.xml`
3. **Click "Upload"** and then **"Import"**

### Step 4: Add Sample Data (1 minute)

1. **Go to System Definition > Scripts - Background**
2. **Copy and paste** the content from `sample_data_script.js`
3. **Click "Run script"**
4. **Check logs** for successful insertion

### Step 5: Create Portal Page (4 minutes)

1. **Go to Service Portal > Pages**
2. **Click "New"**
3. **Page Details:**
   - **Title:** SNAS Portfolio Dashboard
   - **ID:** snas_portfolio
   - **CSS:** Copy the CSS from the widget showcase
4. **Add Widget to Page:**
   - **Widget:** SNAS Badge Display
   - **Column:** 1
   - **Widget Options:**
     ```json
     {
       "title": "🎖️ My Achievement Badges",
       "max_badges": "10", 
       "show_ai_insights": "true",
       "default_audience": "it_recruiters"
     }
     ```

## 🎉 Test Your Setup

### View Your Dashboard:
```
https://dev231111.service-now.com/sp?id=snas_portfolio
```

### Expected Results:
- ✅ Badge display widget loads
- ✅ Sample achievements appear
- ✅ Audience dropdown works
- ✅ AI Prioritize button responds
- ✅ Military heritage styling (Navy & Gold colors)

## 🔧 Advanced Configuration (Optional)

### Configure System Properties:
1. **Go to System Properties > All**
2. **Filter by:** x_snc_snas_port
3. **Set these values:**

| Property | Value | Description |
|----------|-------|-------------|
| x_snc_snas_port.ai_api_key | [Your AI Key] | Manus.ai API key |
| x_snc_snas_port.ai_endpoint | https://api.manus.ai/v1/ | AI API endpoint |
| x_snc_snas_port.enable_ai | true | Enable AI features |
| x_snc_snas_port.debug_mode | false | Debug logging |

### Create Script Include:
1. **Go to System Definition > Script Includes**
2. **Click "New"**
3. **Copy content** from `achievement_api_script_include.xml`
4. **Set these values:**
   - **Name:** AchievementAPI
   - **API Name:** x_snc_snas_port.AchievementAPI
   - **Accessible from:** Package

## 🎨 Customization Options

### Widget Styling:
- Colors: Modify CSS variables for different branding
- Layout: Adjust grid columns for different screen sizes  
- Content: Customize badge card information display

### AI Behavior:
- Audience targeting: Add new audience types
- Scoring algorithm: Modify prioritization weights
- Confidence thresholds: Adjust AI confidence levels

## 🚨 Troubleshooting

### Widget Not Loading:
1. Check application scope is active
2. Verify widget is published
3. Check browser console for errors

### No Sample Data:
1. Re-run sample data script
2. Check table permissions
3. Verify table field structure

### AI Features Not Working:
1. Check system properties configuration
2. Verify AchievementAPI script include
3. Enable debug mode for detailed logs

## 📊 Performance Monitoring

### Key Metrics to Watch:
- Widget load time: < 2 seconds
- AI response time: < 3 seconds  
- Database query performance
- User engagement analytics

### Monitoring Locations:
- System Logs > All
- Performance Analytics > Database
- Service Portal Analytics

## 🎯 Next Steps

### Phase 2 Enhancements:
1. **Data Table Widget:** Add sortable achievement table
2. **Statistics Widget:** Real-time KPI dashboard
3. **Form Widget:** Advanced AI configuration panel
4. **Mobile App:** ServiceNow mobile integration
5. **Analytics Dashboard:** Comprehensive reporting

### Integration Opportunities:
1. **HR Systems:** Employee achievement tracking
2. **Learning Platforms:** Training completion integration
3. **Performance Reviews:** Achievement-based evaluations
4. **Social Sharing:** LinkedIn integration for badge sharing

## 🇺🇸 Service to Success Initiative

**Mission Status:** Deployment Ready  
**Confidence Level:** Very High  
**Target Audience:** Veteran Technology Professionals

*Transforming military excellence into technology leadership through AI-enhanced professional portfolios*

---

## 📞 Support Resources

### Documentation:
- [ServiceNow Widget Development](https://docs.servicenow.com/bundle/utah-servicenow-platform/page/build/service-portal/concept/c_WidgetDevelopment.html)
- [Service Portal Pages](https://docs.servicenow.com/bundle/utah-servicenow-platform/page/build/service-portal/concept/c_ServicePortalPages.html)
- [Script Includes](https://docs.servicenow.com/bundle/utah-servicenow-platform/page/script/server-scripting/concept/c_ScriptIncludes.html)

### Instance Access:
- **ServiceNow Studio:** For development and configuration
- **System Administrator:** For advanced settings and security
- **Service Portal Designer:** For page layout and widget management

**Built with Military Precision | Powered by AI Innovation | Serving Veteran Excellence** 🎖️</content>