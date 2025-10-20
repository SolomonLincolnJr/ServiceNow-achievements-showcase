# ServiceNow Personal Development Instance (PDI)

**Status**: ✅ Active and Ready  
**Instance Provisioned**: October 20, 2025  
**Last Updated**: October 20, 2025

---

## 🔐 Instance Details

| Property | Value |
|----------|-------|
| **Instance Name** | dev231111 |
| **Service URL** | https://dev231111.service-now.com/ |
| **Username** | admin |
| **Password** | `Il^6ceC1@RaG` |
| **Instance Type** | Personal Development Instance (PDI) |
| **Region** | Default |

---

## 🔗 Quick Access Links

- **Login Portal**: [https://dev231111.service-now.com/](https://dev231111.service-now.com/)
- **Instance Management**: [Developer Site - My Instance](https://developer.servicenow.com/)
- **Management Path**: Navigate via main menu → **Manage** → **Instance**

---

## 📋 Instance Management

### Access Management Portal
1. Visit: https://developer.servicenow.com/
2. Navigate: Main Menu → **Manage** → **Instance**
3. Select: **dev231111** instance

### Available Actions
- **Hibernate/Wake**: Control instance state
- **Reset Password**: Generate new admin password
- **Clone**: Create instance copy
- **Delete**: Remove instance (careful!)
- **Extend**: Extend instance lifetime

---

## 🚀 Deployment Checklist

### Initial Setup
- [ ] Login to instance with provided credentials
- [ ] Verify admin access and permissions
- [ ] Update admin user profile information
- [ ] Configure instance timezone and locale

### Application Deployment
- [ ] Install SNAS Portfolio application
- [ ] Configure system properties (API keys, settings)
- [ ] Import achievement data (40+ badges)
- [ ] Set up AI integration (Manus.ai)
- [ ] Deploy REST API endpoints
- [ ] Test badge prioritization algorithms
- [ ] Configure veteran mission theme

### Verification
- [ ] Test dashboard functionality
- [ ] Verify AI prioritization (<2 sec SLA)
- [ ] Validate REST API endpoints
- [ ] Check badge data population
- [ ] Test LinkedIn export flow
- [ ] Review security and access controls

---

## 🔒 Security Best Practices

### Password Management
- ⚠️ **Change default password** after first login
- Store credentials in secure password manager
- Enable two-factor authentication if available
- Never commit passwords to version control

### Access Control
- Limit admin account usage to administrative tasks
- Create separate user accounts for testing
- Review and audit access logs regularly
- Implement role-based access control (RBAC)

### Instance Security
- Keep instance updated with latest patches
- Monitor instance activity and logs
- Implement IP whitelisting if needed
- Regular security audits and reviews

---

## 📊 Instance Usage

### Development Lifecycle
1. **Development**: Use dev231111 for all development work
2. **Testing**: Test features and integrations
3. **Staging**: Prepare for production deployment
4. **Production**: Deploy to production instance when ready

### Resource Limits
- **Storage**: Check instance storage limits
- **API Calls**: Monitor API usage and rate limits
- **Users**: Personal instance typically limited to admin user
- **Uptime**: PDI may hibernate after inactivity

---

## 🛠️ Troubleshooting

### Common Issues

**Instance Hibernated**
- **Symptom**: Cannot access instance URL
- **Solution**: Wake instance from Developer Portal
- **Prevention**: Regular instance activity

**Login Issues**
- **Symptom**: Cannot login with credentials
- **Solution**: Reset password via Developer Portal
- **Check**: Verify instance name and URL are correct

**Deployment Failures**
- **Symptom**: Application won't install
- **Solution**: Check logs, verify instance version
- **Support**: Contact ServiceNow Developer support

### Support Resources
- **Developer Portal**: https://developer.servicenow.com/
- **Community**: https://www.servicenow.com/community/
- **Documentation**: https://docs.servicenow.com/
- **Support**: Developer program support channels

---

## 📝 Notes

### Instance Lifecycle
- Personal Development Instances typically last 10 days of inactivity
- Regularly login or wake instance to prevent hibernation
- Can request extension if needed for active development

### Backup Strategy
- **Application XML**: Export application definitions regularly
- **Update Sets**: Create update sets for all changes
- **Data Export**: Export critical data periodically
- **Version Control**: Commit all code to Git repository

### Best Practices
- Use update sets for tracking changes
- Document all configurations and customizations
- Test changes in sub-production before deploying
- Maintain clean instance with regular cleanup

---

## 🎯 SNAS Application Deployment

### Pre-Deployment Checklist
1. Verify instance is awake and accessible
2. Login as admin user
3. Navigate to System Definition → Plugins
4. Ensure required plugins are activated
5. Verify instance version compatibility

### Deployment Steps
1. **Import Application XML**: 
   - Navigate to System Applications → Studio
   - Import `sn_snas_portfolio.xml`
   
2. **Configure System Properties**:
   - Import from `config/system_properties.xml`
   - Set Manus.ai API key (encrypted)
   - Configure performance SLAs
   
3. **Deploy Script Includes**:
   - Import `AchievementAPI.js`
   - Import `SNASRestAPI.js`
   
4. **Create Achievement Table**:
   - Import table definition
   - Verify field configurations
   
5. **Deploy UI Components**:
   - Import dashboard HTML/CSS/JS
   - Configure veteran theme colors
   
6. **Import Badge Data**:
   - Run initial data import
   - Verify 40+ achievements loaded
   - Test prioritization algorithms

### Post-Deployment Verification
- [ ] Access dashboard at `/x_snc_snas_port/snas_portfolio_dashboard`
- [ ] Test REST API endpoints
- [ ] Verify AI integration
- [ ] Check badge prioritization
- [ ] Validate CSA certification boost (+25 points)
- [ ] Test LinkedIn export functionality

---

## 🔄 Maintenance Schedule

### Daily
- Monitor instance health and availability
- Check for any error logs or issues
- Verify API integration status

### Weekly
- Review instance usage and performance
- Export update sets and backup configurations
- Update documentation as needed

### Monthly
- Complete security audit
- Review and optimize instance performance
- Plan and implement new features

---

**Last Credential Update**: October 20, 2025  
**Next Review Date**: October 27, 2025

---

*This document contains sensitive credentials. Store securely and never commit to public repositories.*
