/**
 * SNAS LinkedIn Export Flow - UI Notification Script
 * 
 * Flow Action 7: UI Notification with SNAS Branding
 * Performance Target: <50ms execution time
 * 
 * Sends branded notifications to UI with military heritage styling
 * and WCAG 2.1 AA accessibility compliance for screen readers.
 */

(function execute(inputs, outputs) {
    'use strict';
    
    var startTime = new Date().getTime();
    
    try {
        // Input validation
        var status = inputs.status || 'Unknown';
        var achievementTitle = inputs.achievement_title || 'Achievement';
        var errorMessage = inputs.error_message || '';
        var navyColor = inputs.navy_color || '#1B365D';
        var goldColor = inputs.gold_color || '#FFD700';
        
        // Determine notification type and message
        var notificationType = 'info';
        var notificationMessage = '';
        var notificationIcon = '';
        var ariaLabel = '';
        
        if (status === 'Success') {
            notificationType = 'success';
            notificationIcon = '🎖️';
            notificationMessage = 'Achievement shared successfully to LinkedIn!';
            ariaLabel = 'Success: ' + achievementTitle + ' has been shared to LinkedIn';
        } else if (status === 'Failed') {
            notificationType = 'error';
            notificationIcon = '⚠️';
            notificationMessage = 'LinkedIn export failed: ' + (errorMessage || 'Unknown error occurred');
            ariaLabel = 'Error: Failed to share ' + achievementTitle + ' to LinkedIn';
        } else {
            notificationType = 'info';
            notificationIcon = 'ℹ️';
            notificationMessage = 'LinkedIn export status: ' + status;
            ariaLabel = 'Information: LinkedIn export status is ' + status;
        }
        
        // Build SNAS-branded notification object
        var notification = {
            message: notificationIcon + ' ' + notificationMessage,
            type: notificationType,
            duration: 5000, // 5 seconds for accessibility
            title: 'SNAS LinkedIn Export',
            
            // SNAS Military Heritage Styling
            styling: {
                backgroundColor: status === 'Success' ? navyColor : (status === 'Failed' ? '#8B0000' : navyColor),
                color: status === 'Success' ? goldColor : '#FFFFFF',
                borderLeft: '4px solid ' + goldColor,
                fontFamily: 'Arial, sans-serif', // Accessible font
                fontSize: '14px',
                fontWeight: '600',
                padding: '12px 16px',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(27, 54, 93, 0.3)',
                minHeight: '48px' // Touch target size for accessibility
            },
            
            // WCAG 2.1 AA Accessibility Features
            accessibility: {
                ariaLabel: ariaLabel,
                ariaLive: 'polite', // Announces to screen readers
                role: 'alert',
                tabIndex: 0,
                ariaDescribedBy: 'snas-notification-desc'
            },
            
            // Military heritage branding elements
            branding: {
                iconColor: goldColor,
                textColor: status === 'Success' ? goldColor : '#FFFFFF',
                borderColor: goldColor,
                gradient: status === 'Success' ? 
                    'linear-gradient(135deg, ' + navyColor + ' 0%, #2A4A7A 100%)' :
                    'linear-gradient(135deg, #8B0000 0%, #A52A2A 100%)'
            },
            
            // Action buttons for enhanced UX
            actions: status === 'Success' ? [{
                label: 'View on LinkedIn',
                action: 'open_linkedin',
                styling: {
                    backgroundColor: goldColor,
                    color: navyColor,
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                },
                accessibility: {
                    ariaLabel: 'Open LinkedIn to view shared achievement'
                }
            }] : [],
            
            // Performance and tracking metadata
            metadata: {
                achievement_title: achievementTitle,
                timestamp: new Date().toISOString(),
                flow_execution: 'SNAS_LinkedIn_Export',
                version: '1.0.0'
            }
        };
        
        // Create client-side notification script for UI Builder integration
        var clientScript = `
            // SNAS LinkedIn Export - Client Notification Handler
            (function() {
                var notification = ` + JSON.stringify(notification) + `;
                
                // Enhanced notification display with SNAS branding
                if (typeof api !== 'undefined' && api.notify) {
                    api.notify({
                        message: notification.message,
                        type: notification.type,
                        duration: notification.duration,
                        className: 'snas-notification',
                        style: notification.styling
                    });
                } else if (typeof window !== 'undefined') {
                    // Fallback for direct browser implementation
                    var toast = document.createElement('div');
                    toast.className = 'snas-toast snas-' + notification.type;
                    toast.setAttribute('role', notification.accessibility.role);
                    toast.setAttribute('aria-label', notification.accessibility.ariaLabel);
                    toast.setAttribute('aria-live', notification.accessibility.ariaLive);
                    toast.style.cssText = Object.keys(notification.styling)
                        .map(key => key.replace(/([A-Z])/g, '-$1').toLowerCase() + ':' + notification.styling[key])
                        .join(';');
                    toast.textContent = notification.message;
                    
                    document.body.appendChild(toast);
                    
                    // Auto-remove after duration
                    setTimeout(function() {
                        if (toast.parentNode) {
                            toast.parentNode.removeChild(toast);
                        }
                    }, notification.duration);
                }
                
                // Console logging for debugging
                console.log('SNAS Notification:', notification.message);
            })();
        `;
        
        // Calculate execution time
        var endTime = new Date().getTime();
        var executionTime = endTime - startTime;
        
        // Set outputs
        outputs.notification_sent = true;
        outputs.notification_type = notificationType;
        outputs.client_script = clientScript;
        outputs.notification_object = JSON.stringify(notification);
        
        // Performance validation
        if (executionTime > 50) {
            gs.warn('SNAS UI Notification: Exceeded 50ms target. Time: ' + executionTime + 'ms');
        }
        
        // Performance monitoring
        if (gs.getProperty('x_snc_snas_port.linkedin_performance_monitoring') === 'true') {
            gs.info('SNAS UI Notification Sent: ' + notificationType + ' (' + executionTime + 'ms)');
        }
        
        // Accessibility validation
        var contrastRatio = calculateContrastRatio(
            status === 'Success' ? goldColor : '#FFFFFF', 
            status === 'Success' ? navyColor : '#8B0000'
        );
        
        if (contrastRatio < 4.5) {
            gs.warn('SNAS Accessibility Warning: Color contrast ratio ' + contrastRatio + ' below WCAG AA standard (4.5:1)');
        }
        
    } catch (error) {
        gs.error('SNAS UI Notification Error: ' + error.toString());
        
        // Fallback notification
        outputs.notification_sent = false;
        outputs.notification_type = 'error';
        outputs.client_script = 'console.error("SNAS notification failed: ' + error.toString() + '");';
        outputs.notification_object = '{}';
    }
    
    // Helper function for accessibility compliance
    function calculateContrastRatio(foreground, background) {
        // Simplified contrast calculation for validation
        // In production, use full WCAG contrast calculation
        var fgLuminance = getLuminance(foreground);
        var bgLuminance = getLuminance(background);
        
        var lighter = Math.max(fgLuminance, bgLuminance);
        var darker = Math.min(fgLuminance, bgLuminance);
        
        return (lighter + 0.05) / (darker + 0.05);
    }
    
    function getLuminance(color) {
        // Basic luminance calculation
        // Convert hex to RGB and calculate relative luminance
        var hex = color.replace('#', '');
        var r = parseInt(hex.substr(0, 2), 16) / 255;
        var g = parseInt(hex.substr(2, 2), 16) / 255;
        var b = parseInt(hex.substr(4, 2), 16) / 255;
        
        return 0.299 * r + 0.587 * g + 0.114 * b;
    }
    
})(inputs, outputs);