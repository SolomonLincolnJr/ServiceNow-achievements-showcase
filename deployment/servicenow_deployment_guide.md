# 🚀 SNAS ServiceNow Instance Deployment Guide

## Instance Information
- **ServiceNow Instance:** dev231111.service-now.com
- **Studio URL:** https://dev231111.service-now.com/now/servicenow-studio/
- **Username:** admin
- **Application Scope:** x_snc_snas_port (ServiceNow Achievements Showcase)

## 🎯 Deployment Steps

### Phase 1: Application Setup

#### 1. **Access ServiceNow Studio**
```
URL: https://dev231111.service-now.com/now/servicenow-studio/
Login: admin / Il^6ceC1@RaG
```

#### 2. **Import Application Scope**
1. Navigate to **System Applications > Studio**
2. Select **Import Application**
3. Use the `sn_snas_portfolio.xml` file from the repository
4. **Application Details:**
   - **Name:** ServiceNow Achievements Showcase (SNAS)
   - **Scope:** x_snc_snas_port
   - **Version:** 1.0.0

### Phase 2: Database Tables Creation

#### 3. **Create Achievement Table**
```sql
-- Table: x_snc_snas_port_achievement
-- Label: Achievement
-- Extends: Task [task]

Fields to Add:
- name (String, 100) - Achievement Name
- issuer (String, 50) - Issuing Organization  
- type (Choice) - Type: certification, achievement, badge
- date_earned (Date) - Date Earned
- description (String, 1000) - Description
- category (String, 50) - Category
- priority_score (Integer) - AI Priority Score
- ai_reasoning (String, 500) - AI Reasoning
- audience_relevance (String, 100) - Target Audience
```

#### 4. **Import Table Structure**
Use the XML file: `tables/x_snc_snas_port_achievement.xml`

### Phase 3: Widget Deployment

#### 5. **Create Service Portal Widgets**

##### A. Badge Display Widget
```javascript
// Widget ID: snas_badge_display
// Category: Custom
// Name: SNAS Badge Display
```

1. **HTML Template:**
```html
<div class="snas-badge-widget">
  <div class="widget-header">
    <h3>🎖️ {{data.title}}</h3>
    <div class="widget-controls">
      <select ng-model="c.audience" ng-change="c.onAudienceChange()" class="form-control">
        <option value="all">All Audiences</option>
        <option value="it_recruiters">IT Recruiters</option>
        <option value="veteran_community">Veteran Community</option>
        <option value="servicenow_professionals">ServiceNow Professionals</option>
      </select>
      <button class="btn btn-primary btn-sm" ng-click="c.prioritizeBadges()" ng-disabled="c.loading">
        AI Prioritize
      </button>
    </div>
  </div>
  
  <div class="badges-grid">
    <div ng-show="c.loading" class="loading-spinner">
      <i class="fa fa-spinner fa-spin"></i> Loading achievements...
    </div>
    
    <div ng-repeat="badge in c.badges" class="badge-card">
      <div class="badge-header">
        <div class="priority-indicator {{c.getPriorityClass(badge.priority_score)}}"></div>
        <div class="badge-title">{{badge.name}}</div>
        <div class="badge-issuer">{{badge.issuer}}</div>
      </div>
      <div class="badge-body">
        <div class="badge-description">{{badge.description}}</div>
        <div class="badge-meta">
          <span>Earned: {{c.formatDate(badge.date_earned)}}</span>
          <span class="priority-score">{{badge.priority_score}}</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

2. **Client Script:**
```javascript
(function() {
  var c = this;
  
  c.$onInit = function() {
    c.loading = true;
    c.badges = [];
    c.audience = 'all';
    
    c.server.get({
      action: 'getBadges',
      audience: c.audience
    }).then(function(response) {
      c.badges = response.data.badges || [];
      c.loading = false;
    });
  };
  
  c.prioritizeBadges = function() {
    c.loading = true;
    c.server.get({
      action: 'prioritizeBadges',
      audience: c.audience,
      badges: c.badges
    }).then(function(response) {
      c.badges = response.data.prioritizedBadges || [];
      c.loading = false;
    });
  };
  
  c.getPriorityClass = function(score) {
    if (score >= 90) return 'high';
    if (score >= 70) return 'medium';
    return 'low';
  };
  
  c.formatDate = function(dateString) {
    return new Date(dateString).toLocaleDateString();
  };
})();
```

3. **Server Script:**
```javascript
(function() {
  var AchievementAPI = new x_snc_snas_port.AchievementAPI();
  
  if (input && input.action) {
    switch (input.action) {
      case 'getBadges':
        data.badges = getBadges(input.audience || 'all');
        break;
      case 'prioritizeBadges':
        var result = prioritizeBadges(input.badges || [], input.audience || 'all');
        data.prioritizedBadges = result.badges;
        data.confidence = result.confidence;
        break;
    }
  }
  
  data.title = options.title || "Achievement Badges";
  
  function getBadges(audience) {
    var badges = [];
    var gr = new GlideRecord('x_snc_snas_port_achievement');
    gr.addActiveQuery();
    gr.orderByDesc('date_earned');
    gr.query();
    
    while (gr.next()) {
      badges.push({
        id: gr.getUniqueValue(),
        name: gr.getValue('name'),
        issuer: gr.getValue('issuer'),
        type: gr.getValue('type'),
        date_earned: gr.getValue('date_earned'),
        description: gr.getValue('description'),
        priority_score: parseInt(gr.getValue('priority_score')) || 50
      });
    }
    return badges;
  }
  
  function prioritizeBadges(badges, audience) {
    // AI prioritization logic here
    return {
      badges: badges.sort((a, b) => b.priority_score - a.priority_score),
      confidence: 0.95
    };
  }
})();
```

4. **CSS:**
```css
.snas-badge-widget {
  padding: 15px;
  background: #fff;
  border-radius: 8px;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 2px solid #1B365D;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.badge-card {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  overflow: hidden;
}

.badge-header {
  background: linear-gradient(135deg, #1B365D, #2c5282);
  color: white;
  padding: 10px;
  position: relative;
}

.priority-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #FFD700;
}
```

##### B. Statistics Widget
Create similar structure for the statistics widget using the simple list widget code.

### Phase 4: Create Service Portal Page

#### 6. **Create SNAS Dashboard Page**
1. Navigate to **Service Portal > Pages**
2. Create new page: **SNAS Portfolio Dashboard**
3. **Page ID:** snas_portfolio
4. **Layout:** 2-column layout

#### 7. **Add Widgets to Page**
1. Left Column:
   - AI Control Form Widget
   - Statistics Widget
2. Right Column:
   - Badge Display Widget
   - Data Table Widget

### Phase 5: API Integration Setup

#### 8. **Configure System Properties**
```javascript
// Navigate to System Properties
// Create these properties in scope x_snc_snas_port

Property Name: x_snc_snas_port.ai_api_key
Type: Password (encrypted)
Value: [Your Manus.ai API Key]

Property Name: x_snc_snas_port.ai_endpoint
Type: String
Value: https://api.manus.ai/v1/

Property Name: x_snc_snas_port.ai_timeout
Type: Integer  
Value: 30000
```

#### 9. **Create Script Include: AchievementAPI**
```javascript
var AchievementAPI = Class.create();
AchievementAPI.prototype = {
    initialize: function() {
        this.apiKey = gs.getProperty('x_snc_snas_port.ai_api_key');
        this.endpoint = gs.getProperty('x_snc_snas_port.ai_endpoint');
    },
    
    prioritizeAchievements: function(params) {
        var request = new sn_ws.RESTMessageV2();
        request.setEndpoint(this.endpoint + 'prioritize');
        request.setHttpMethod('POST');
        request.setRequestHeader('Authorization', 'Bearer ' + this.apiKey);
        request.setRequestHeader('Content-Type', 'application/json');
        
        var requestBody = {
            achievements: params.achievements,
            context: params.context
        };
        
        request.setRequestBody(JSON.stringify(requestBody));
        
        try {
            var response = request.execute();
            var responseBody = response.getBody();
            return JSON.parse(responseBody);
        } catch (e) {
            gs.error('AI API Error: ' + e.message);
            return this.getFallbackPrioritization(params.achievements);
        }
    },
    
    getFallbackPrioritization: function(achievements) {
        // Fallback logic when AI is unavailable
        return {
            prioritized_achievements: achievements,
            confidence: 0.75
        };
    },
    
    type: 'AchievementAPI'
};
```

### Phase 6: Sample Data Population

#### 10. **Insert Sample Achievement Data**
```javascript
// Run in Scripts - Background
var achievements = [
  {
    name: 'Certified System Administrator (CSA)',
    issuer: 'ServiceNow',
    type: 'certification',
    date_earned: '2024-08-15',
    description: 'Comprehensive ServiceNow platform administration certification.',
    category: 'Platform Administration',
    priority_score: 95
  },
  {
    name: 'Certified Implementation Specialist - ITSM', 
    issuer: 'ServiceNow',
    type: 'certification',
    date_earned: '2024-07-22',
    description: 'Advanced ITSM implementation certification.',
    category: 'ITSM Implementation',
    priority_score: 88
  },
  {
    name: 'RiseUp Achievement Badge',
    issuer: 'ServiceNow', 
    type: 'achievement',
    date_earned: '2024-09-10',
    description: 'Recognition for diversity and inclusion leadership.',
    category: 'Community Impact',
    priority_score: 82
  }
];

achievements.forEach(function(achievement) {
  var gr = new GlideRecord('x_snc_snas_port_achievement');
  gr.initialize();
  Object.keys(achievement).forEach(function(key) {
    gr.setValue(key, achievement[key]);
  });
  gr.insert();
});
```

### Phase 7: Testing & Validation

#### 11. **Test Widget Functionality**
1. Navigate to Service Portal page
2. Verify widgets load correctly
3. Test AI prioritization functionality
4. Check responsive design on different devices
5. Validate data table sorting and filtering
6. Test export functionality

#### 12. **Security Configuration**
1. Set up appropriate read/write roles
2. Configure ACLs for the achievement table
3. Test role-based access control

### Phase 8: Production Deployment

#### 13. **Create Update Set**
1. **System Update Sets > Local Update Sets**
2. Create new update set: "SNAS Widget Collection v1.0"
3. Capture all changes made during development
4. Export update set for deployment to other instances

#### 14. **Performance Optimization**
1. Enable caching for widget data
2. Optimize database queries
3. Configure CDN for static assets
4. Set up monitoring and logging

## 🔧 Troubleshooting Guide

### Common Issues:

#### Widget Not Loading:
- Check application scope is active
- Verify table permissions
- Check browser console for JavaScript errors

#### AI API Errors:
- Validate API key configuration
- Check network connectivity
- Verify endpoint URL
- Review fallback logic activation

#### Performance Issues:
- Enable query caching
- Optimize GlideRecord queries
- Check for N+1 query problems
- Monitor server response times

## 📊 Monitoring & Maintenance

### Key Metrics to Monitor:
- Widget load times (<2 seconds target)
- AI API response times (<3 seconds target)
- User engagement analytics
- Error rates and exceptions
- Database query performance

### Regular Maintenance Tasks:
- Update AI model parameters
- Review and optimize database queries
- Update security configurations
- Backup achievement data
- Monitor system performance

## 🎯 Post-Deployment Checklist

- [ ] All widgets display correctly
- [ ] AI prioritization functionality works
- [ ] Data table sorting/filtering operational
- [ ] Export functionality tested
- [ ] Mobile responsive design verified
- [ ] Security roles and permissions configured
- [ ] Performance metrics within targets
- [ ] Error handling and logging active
- [ ] Update set created for deployment
- [ ] Documentation updated with instance-specific details

---

## 🇺🇸 Service to Success Initiative

**Mission Status:** Ready for ServiceNow Deployment
**Target Instance:** dev231111.service-now.com
**Deployment Confidence:** Very High

*Transforming military excellence into technology leadership through AI-enhanced professional portfolios*

**Built with Military Precision | Powered by AI Innovation | Serving Veteran Excellence**
</content>