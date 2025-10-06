/**
 * SNAS LinkedIn Export Flow - UI Builder Controller
 * 
 * Handles LinkedIn sharing interactions with military heritage branding
 * Performance Target: <0.5s UI render, real-time status updates
 * Accessibility: WCAG 2.1 AA compliant with full keyboard navigation
 */

var SNASLinkedInController = (function() {
    'use strict';
    
    // Private variables
    var currentAchievement = null;
    var isSharing = false;
    var generatedContent = null;
    var performanceMetrics = {
        renderStart: null,
        renderEnd: null,
        shareStart: null,
        shareEnd: null
    };
    
    // SNAS branding constants
    var BRANDING = {
        colors: {
            navy: '#1B365D',
            gold: '#FFD700',
            navyLight: '#2A4A7A',
            white: '#FFFFFF'
        },
        animations: {
            duration: 300,
            easing: 'ease-in-out'
        }
    };
    
    /**
     * Initialize the SNAS LinkedIn component
     * @param {Object} achievementData - The achievement data to display
     */
    function init(achievementData) {
        performanceMetrics.renderStart = performance.now();
        
        try {
            currentAchievement = achievementData;
            
            // Validate required data
            if (!achievementData || !achievementData.sys_id) {
                throw new Error('Invalid achievement data provided');
            }
            
            // Setup event listeners
            setupEventListeners();
            
            // Generate initial content preview
            generateContentPreview();
            
            // Setup accessibility enhancements
            setupAccessibility();
            
            // Initialize performance monitoring
            initializePerformanceMonitoring();
            
            performanceMetrics.renderEnd = performance.now();
            
            var renderTime = performanceMetrics.renderEnd - performanceMetrics.renderStart;
            console.log('SNAS LinkedIn Component rendered in ' + renderTime.toFixed(2) + 'ms');
            
            if (renderTime > 500) {
                console.warn('SNAS Performance Warning: Render time exceeded 500ms target');
            }
            
            // Announce to screen readers
            announceToScreenReader('SNAS LinkedIn sharing component loaded for ' + achievementData.title);
            
        } catch (error) {
            console.error('SNAS LinkedIn Controller Error:', error);
            showStatusMessage('Failed to initialize LinkedIn sharing component', 'error');
        }
    }
    
    /**
     * Setup event listeners for component interactions
     */
    function setupEventListeners() {
        var shareButton = document.getElementById('snas-linkedin-share-btn');
        var previewButton = document.querySelector('[onclick*="previewContent"]');
        var editButton = document.querySelector('[onclick*="editContent"]');
        var contentTextarea = document.getElementById('linkedin-content-textarea');
        
        // Share button click handler
        if (shareButton) {
            shareButton.addEventListener('click', handleShareClick);
            shareButton.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleShareClick();
                }
            });
        }
        
        // Content textarea character counter
        if (contentTextarea) {
            contentTextarea.addEventListener('input', updateCharacterCount);
            contentTextarea.addEventListener('paste', function() {
                setTimeout(updateCharacterCount, 10);
            });
        }
        
        // Modal close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
        
        // Focus management for accessibility
        document.addEventListener('focusin', handleFocusManagement);
    }
    
    /**
     * Handle share button click with performance monitoring
     */
    function handleShareClick() {
        if (isSharing) {
            return; // Prevent double-clicking
        }
        
        performanceMetrics.shareStart = performance.now();
        isSharing = true;
        
        try {
            // Update UI to show loading state
            showLoadingState();
            
            // Trigger ServiceNow Flow by updating the achievement record
            triggerLinkedInFlow();
            
        } catch (error) {
            console.error('SNAS Share Error:', error);
            showStatusMessage('Failed to initiate LinkedIn sharing: ' + error.message, 'error');
            hideLoadingState();
            isSharing = false;
        }
    }
    
    /**
     * Trigger the ServiceNow Flow for LinkedIn export
     */
    function triggerLinkedInFlow() {
        // Use ServiceNow's GlideAjax or REST API to update the achievement record
        var ga = new GlideAjax('SNASLinkedInAjax');
        ga.addParam('sysparm_name', 'triggerExport');
        ga.addParam('sysparm_achievement_id', currentAchievement.sys_id);
        ga.addParam('sysparm_custom_content', generatedContent);
        
        ga.getXML(function(response) {
            try {
                var result = response.responseXML.getElementsByTagName('item')[0].getAttribute('answer');
                var resultData = JSON.parse(result);
                
                if (resultData.success) {
                    // Poll for completion
                    pollFlowExecution(resultData.execution_id);
                } else {
                    throw new Error(resultData.error || 'Unknown error occurred');
                }
                
            } catch (error) {
                console.error('SNAS Flow Trigger Error:', error);
                showStatusMessage('Failed to trigger LinkedIn export flow', 'error');
                hideLoadingState();
                isSharing = false;
            }
        });
    }
    
    /**
     * Poll for flow execution completion
     * @param {string} executionId - The flow execution ID to monitor
     */
    function pollFlowExecution(executionId) {
        var pollCount = 0;
        var maxPolls = 20; // 10 seconds maximum
        var pollInterval = 500; // 500ms intervals
        
        function poll() {
            pollCount++;
            
            var ga = new GlideAjax('SNASLinkedInAjax');
            ga.addParam('sysparm_name', 'checkFlowStatus');
            ga.addParam('sysparm_execution_id', executionId);
            
            ga.getXML(function(response) {
                try {
                    var result = response.responseXML.getElementsByTagName('item')[0].getAttribute('answer');
                    var statusData = JSON.parse(result);
                    
                    if (statusData.completed) {
                        handleFlowCompletion(statusData);
                    } else if (pollCount >= maxPolls) {
                        throw new Error('Flow execution timeout');
                    } else {
                        // Continue polling
                        setTimeout(poll, pollInterval);
                        updateProgress((pollCount / maxPolls) * 100);
                    }
                    
                } catch (error) {
                    console.error('SNAS Flow Status Error:', error);
                    showStatusMessage('Error monitoring LinkedIn export progress', 'error');
                    hideLoadingState();
                    isSharing = false;
                }
            });
        }
        
        // Start polling
        poll();
    }
    
    /**
     * Handle flow execution completion
     * @param {Object} statusData - Flow completion status and results
     */
    function handleFlowCompletion(statusData) {
        performanceMetrics.shareEnd = performance.now();
        var totalTime = performanceMetrics.shareEnd - performanceMetrics.shareStart;
        
        isSharing = false;
        hideLoadingState();
        
        if (statusData.success) {
            // Success notification with military heritage styling
            showStatusMessage('🎖️ Achievement successfully shared to LinkedIn!', 'success');
            
            // Update UI to reflect shared status
            markAsShared();
            
            // Performance logging
            console.log('SNAS LinkedIn Export completed in ' + totalTime.toFixed(2) + 'ms');
            
            // Announce success to screen readers
            announceToScreenReader('Achievement successfully shared to LinkedIn');
            
            // Optional: Open LinkedIn in new tab
            if (statusData.linkedin_url) {
                setTimeout(function() {
                    if (confirm('Would you like to view your post on LinkedIn?')) {
                        window.open(statusData.linkedin_url, '_blank', 'noopener,noreferrer');
                    }
                }, 2000);
            }
            
        } else {
            // Error handling with detailed messaging
            var errorMessage = statusData.error || 'Unknown error occurred during LinkedIn export';
            showStatusMessage('❌ LinkedIn export failed: ' + errorMessage, 'error');
            
            // Log error for debugging
            console.error('SNAS LinkedIn Export failed:', statusData);
            
            // Announce error to screen readers
            announceToScreenReader('LinkedIn export failed. Please try again or contact support.');
        }
        
        // Performance validation
        if (totalTime > 1800) {
            console.warn('SNAS Performance Warning: Total export time exceeded 1.8s SLA target');
        }
    }
    
    /**
     * Generate content preview for the achievement
     */
    function generateContentPreview() {
        try {
            var previewContainer = document.getElementById('linkedin-content-preview');
            if (!previewContainer || !currentAchievement) {
                return;
            }
            
            // Generate military heritage content
            var content = generateMilitaryHeritageContent(currentAchievement);
            generatedContent = content;
            
            // Display in preview container
            previewContainer.textContent = content.linkedin_content + '\\n\\n' + content.hashtags;
            
            // Update character count if textarea exists
            var textarea = document.getElementById('linkedin-content-textarea');
            if (textarea) {
                textarea.value = content.linkedin_content + '\\n\\n' + content.hashtags;
                updateCharacterCount();
            }
            
        } catch (error) {
            console.error('SNAS Preview Generation Error:', error);
            document.getElementById('linkedin-content-preview').textContent = 
                'Error generating preview. Please try refreshing the page.';
        }
    }
    
    /**
     * Generate military heritage content for LinkedIn
     * @param {Object} achievement - Achievement data
     * @returns {Object} Generated content with LinkedIn text and hashtags
     */
    function generateMilitaryHeritageContent(achievement) {
        var templates = {
            'ServiceNow': {
                opening: '🎖️ Another milestone in my Service-to-Success journey!',
                middle: 'Military discipline meets cutting-edge technology as I advance in the ServiceNow ecosystem.',
                hashtags: '#ServiceNow #VeteranInTech #CSA #MilitaryLeadership #ServiceToSuccess'
            },
            'Military': {
                opening: '🇺🇸 Honored to share this recognition of service and leadership!',
                middle: 'Continuing the mission of excellence - from military service to technology innovation.',
                hashtags: '#VeteranLeadership #MilitaryExcellence #ServiceToSuccess #VeteransInTech'
            },
            'Certification': {
                opening: '📜 Proud to announce another certification milestone!',
                middle: 'Military discipline and attention to detail continue to drive professional excellence.',
                hashtags: '#ProfessionalDevelopment #VeteranInTech #ContinuousLearning #ServiceToSuccess'
            },
            'Community': {
                opening: '🤝 Giving back to the community that shaped my values!',
                middle: 'Service doesn\\'t end with the uniform - it evolves. Supporting fellow veterans in technology.',
                hashtags: '#CommunityService #VeteranSupport #MentoringMatters #ServiceToSuccess'
            }
        };
        
        var template = templates[achievement.category] || templates['ServiceNow'];
        
        var content = template.opening + '\\n\\n' +
                     'Just earned: ' + achievement.title + '\\n\\n' +
                     template.middle + '\\n\\n' +
                     '💼 Open to opportunities where military leadership meets technology innovation.';
        
        return {
            linkedin_content: content,
            hashtags: template.hashtags
        };
    }
    
    /**
     * Show loading state with SNAS branding
     */
    function showLoadingState() {
        var button = document.getElementById('snas-linkedin-share-btn');
        var progressContainer = document.querySelector('.snas-progress-container');
        
        if (button) {
            button.disabled = true;
            button.classList.add('loading');
            button.setAttribute('aria-busy', 'true');
        }
        
        if (progressContainer) {
            progressContainer.style.display = 'block';
        }
        
        // Announce to screen readers
        announceToScreenReader('LinkedIn export in progress. Please wait.');
    }
    
    /**
     * Hide loading state
     */
    function hideLoadingState() {
        var button = document.getElementById('snas-linkedin-share-btn');
        var progressContainer = document.querySelector('.snas-progress-container');
        
        if (button) {
            button.disabled = false;
            button.classList.remove('loading');
            button.removeAttribute('aria-busy');
        }
        
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
        
        // Reset progress bar
        updateProgress(0);
    }
    
    /**
     * Update progress bar
     * @param {number} percentage - Progress percentage (0-100)
     */
    function updateProgress(percentage) {
        var progressFill = document.querySelector('.snas-progress-fill');
        var progressBar = document.querySelector('.snas-progress-bar');
        
        if (progressFill) {
            progressFill.style.width = percentage + '%';
        }
        
        if (progressBar) {
            progressBar.setAttribute('aria-valuenow', percentage);
        }
    }
    
    /**
     * Show status message with SNAS branding
     * @param {string} message - Message to display
     * @param {string} type - Message type ('success', 'error', 'info')
     */
    function showStatusMessage(message, type) {
        var statusContainer = document.getElementById('snas-status-message');
        if (!statusContainer) {
            return;
        }
        
        statusContainer.textContent = message;
        statusContainer.className = 'snas-status-message ' + type;
        statusContainer.style.display = 'block';
        
        // Auto-hide after delay for non-error messages
        if (type !== 'error') {
            setTimeout(function() {
                hideStatusMessage();
            }, 5000);
        }
        
        // Announce to screen readers
        announceToScreenReader(message);
    }
    
    /**
     * Hide status message
     */
    function hideStatusMessage() {
        var statusContainer = document.getElementById('snas-status-message');
        if (statusContainer) {
            statusContainer.style.display = 'none';
        }
    }
    
    /**
     * Mark achievement as shared in UI
     */
    function markAsShared() {
        var button = document.getElementById('snas-linkedin-share-btn');
        if (button) {
            button.innerHTML = '<span class=\"snas-button-icon\" aria-hidden=\"true\">✅</span>' +
                              '<span class=\"snas-button-text\">Shared to LinkedIn</span>';
            button.disabled = true;
            button.classList.add('shared');
        }
    }
    
    /**
     * Update character count for textarea
     */
    function updateCharacterCount() {
        var textarea = document.getElementById('linkedin-content-textarea');
        var counter = document.getElementById('char-count');
        
        if (textarea && counter) {
            var count = textarea.value.length;
            counter.textContent = count;
            
            // Color coding for character limits
            if (count > 1200) {
                counter.style.color = '#DC3545'; // Red
            } else if (count > 1000) {
                counter.style.color = '#FFC107'; // Yellow
            } else {
                counter.style.color = '#6C757D'; // Gray
            }
        }
    }
    
    /**
     * Setup accessibility enhancements
     */
    function setupAccessibility() {
        // Ensure all interactive elements have proper ARIA attributes
        var buttons = document.querySelectorAll('.snas-share-button');
        buttons.forEach(function(button) {
            if (!button.getAttribute('aria-label') && !button.getAttribute('aria-labelledby')) {
                button.setAttribute('aria-label', button.textContent.trim());
            }
        });
        
        // Setup focus management for modals
        var modal = document.getElementById('snas-edit-modal');
        if (modal) {
            modal.setAttribute('aria-hidden', 'true');
        }
        
        // Ensure form inputs have proper labels
        var inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(function(input) {
            var label = document.querySelector('label[for=\"' + input.id + '\"]');
            if (!label && input.id) {
                console.warn('SNAS Accessibility: Missing label for input ' + input.id);
            }
        });
    }
    
    /**
     * Announce message to screen readers
     * @param {string} message - Message to announce
     */
    function announceToScreenReader(message) {
        var announcer = document.querySelector('[aria-live=\"polite\"]');
        if (!announcer) {
            // Create announcer element
            announcer = document.createElement('div');
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            document.body.appendChild(announcer);
        }
        
        // Clear and set new message
        announcer.textContent = '';
        setTimeout(function() {
            announcer.textContent = message;
        }, 100);
    }
    
    /**
     * Handle focus management for accessibility
     * @param {Event} e - Focus event
     */
    function handleFocusManagement(e) {
        // Ensure modal focus trapping
        var modal = document.getElementById('snas-edit-modal');
        if (modal && modal.style.display !== 'none') {
            var focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])'
            );
            
            if (!modal.contains(e.target)) {
                // Focus escaped modal, return to first element
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                }
            }
        }
    }
    
    /**
     * Initialize performance monitoring
     */
    function initializePerformanceMonitoring() {
        // Monitor for performance issues
        if ('PerformanceObserver' in window) {
            var observer = new PerformanceObserver(function(list) {
                var entries = list.getEntries();
                entries.forEach(function(entry) {
                    if (entry.duration > 100) {
                        console.warn('SNAS Performance: Slow operation detected', entry);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['measure', 'navigation'] });
        }
    }
    
    /**
     * Preview content in modal (called from HTML)
     */
    function previewContent() {
        generateContentPreview();
        showStatusMessage('Content preview generated successfully', 'info');
    }
    
    /**
     * Edit content in modal (called from HTML)
     */
    function editContent() {
        var modal = document.getElementById('snas-edit-modal');
        if (modal) {
            modal.style.display = 'block';
            modal.setAttribute('aria-hidden', 'false');
            
            // Focus first input
            var firstInput = modal.querySelector('textarea, input');
            if (firstInput) {
                firstInput.focus();
            }
        }
    }
    
    /**
     * Close modal (called from HTML)
     */
    function closeModal() {
        var modal = document.getElementById('snas-edit-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            
            // Return focus to edit button
            var editButton = document.querySelector('[onclick*=\"editContent\"]');
            if (editButton) {
                editButton.focus();
            }
        }
    }
    
    /**
     * Save content from modal (called from HTML)
     */
    function saveContent() {
        var textarea = document.getElementById('linkedin-content-textarea');
        var hashtagsInput = document.getElementById('hashtags-input');
        var previewContainer = document.getElementById('linkedin-content-preview');
        
        if (textarea && previewContainer) {
            var content = textarea.value;
            var hashtags = hashtagsInput ? hashtagsInput.value : '';
            
            generatedContent = {
                linkedin_content: content,
                hashtags: hashtags
            };
            
            previewContainer.textContent = content + (hashtags ? '\\n\\n' + hashtags : '');
            
            closeModal();
            showStatusMessage('Content updated successfully', 'success');
        }
    }
    
    // Public API
    return {
        init: init,
        shareAchievement: handleShareClick,
        previewContent: previewContent,
        editContent: editContent,
        closeModal: closeModal,
        saveContent: saveContent
    };
    
})();

// Global namespace for HTML onclick handlers
window.snasLinkedInShare = SNASLinkedInController;