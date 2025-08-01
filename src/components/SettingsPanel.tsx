// Settings Panel Component

import React, { useState } from 'react';
import { useSettings, useUserProfile, useContentDefaults, useUIPreferences } from '../contexts/SettingsContext';
import type { TeachingStyle, AIIntegrationPreference, EducationLevel, TeachingStyleDetectionResult, AICustomizationSettings, CustomTemplate } from '../types/settings';
import { TeachingStyleDetector } from './TeachingStyleDetector';
import { TeachingStyleResults } from './TeachingStyleResults';
import { AIIntegrationWizard } from './AIIntegrationWizard';
import { AdvancedTemplateEditor } from './AdvancedTemplateEditor';
import { LearningInsights } from './LearningInsights';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { state, actions } = useSettings();
  const [profile, updateProfile] = useUserProfile();
  const [defaults, updateDefaults] = useContentDefaults();
  const [preferences, updatePreferences] = useUIPreferences();
  const [activeTab, setActiveTab] = useState<'profile' | 'defaults' | 'preferences'>('profile');
  const [showStyleDetector, setShowStyleDetector] = useState(false);
  const [showStyleResults, setShowStyleResults] = useState(false);
  const [detectionResult, setDetectionResult] = useState<TeachingStyleDetectionResult | null>(null);
  const [showAIWizard, setShowAIWizard] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showLearningInsights, setShowLearningInsights] = useState(false);

  if (!isOpen || !profile || !defaults || !preferences) return null;

  // Helper function to determine if a section should be visible based on complexity
  const shouldShowForComplexity = (requiredLevel: 'essential' | 'enhanced' | 'advanced'): boolean => {
    const complexityOrder = { essential: 0, enhanced: 1, advanced: 2 };
    const currentLevel = complexityOrder[preferences.formComplexity];
    const requiredOrderLevel = complexityOrder[requiredLevel];
    return currentLevel >= requiredOrderLevel;
  };

  // Get count of hidden features based on current complexity level
  const getHiddenFeaturesSummary = () => {
    const hiddenFeatures: string[] = [];
    
    if (!shouldShowForComplexity('enhanced')) {
      hiddenFeatures.push('Email & Institution settings');
      hiddenFeatures.push('AI Integration preferences');
      hiddenFeatures.push('Detailed answer key options');
      hiddenFeatures.push('Instructor guide options');
      hiddenFeatures.push('AI Configuration wizard');
    }
    
    if (!shouldShowForComplexity('advanced')) {
      hiddenFeatures.push('Point value suggestions');
      hiddenFeatures.push('Discussion prompts & extensions');
      hiddenFeatures.push('Advanced Template Editor');
      hiddenFeatures.push('Learning Insights dashboard');
    }
    
    return hiddenFeatures;
  };

  const handleSaveAndClose = async () => {
    if (state.settings) {
      await actions.saveSettings(state.settings);
    }
    onClose();
  };

  const handleExportSettings = () => {
    const settingsJson = actions.exportSettings();
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'curriculum-curator-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const success = await actions.importSettings(text);
    if (success) {
      alert('Settings imported successfully!');
    } else {
      alert('Failed to import settings. Please check the file format.');
    }
  };

  const handleStyleDetected = (result: TeachingStyleDetectionResult) => {
    setDetectionResult(result);
    setShowStyleDetector(false);
    setShowStyleResults(true);
  };

  const handleAcceptStyle = () => {
    if (detectionResult) {
      updateProfile({ teachingStyle: detectionResult.primaryStyle });
    }
    setShowStyleResults(false);
    setDetectionResult(null);
  };

  const handleRetakeAssessment = () => {
    setShowStyleResults(false);
    setShowStyleDetector(true);
  };

  const handleAIIntegrationComplete = (aiCustomization: AICustomizationSettings) => {
    // Update advanced settings with AI customization
    if (state.settings) {
      const updatedSettings = {
        ...state.settings,
        advanced: {
          ...state.settings.advanced,
          aiCustomization
        }
      };
      actions.saveSettings(updatedSettings);
    }
    setShowAIWizard(false);
  };

  const handleTemplateUpdated = (templates: CustomTemplate[]) => {
    // Templates are already saved in the component, no additional action needed
    console.log('Templates updated:', templates.length);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90%',
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#1e293b' }}>
            ⚙️ Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc'
        }}>
          {[
            { id: 'profile', label: '👤 Profile', icon: '👤' },
            { id: 'defaults', label: '📝 Defaults', icon: '📝' },
            { id: 'preferences', label: '🎨 Interface', icon: '🎨' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '16px 24px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflow: 'auto', maxHeight: '60vh' }}>
          {activeTab === 'profile' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1e293b' }}>
                Your Teaching Profile
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => updateProfile({ name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>

                {shouldShowForComplexity('enhanced') && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email || ''}
                      onChange={(e) => updateProfile({ email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                )}

                {shouldShowForComplexity('enhanced') && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                      Institution
                    </label>
                    <input
                      type="text"
                      value={profile.institution || ''}
                      onChange={(e) => updateProfile({ institution: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                    Subject Area
                  </label>
                  <input
                    type="text"
                    value={profile.subject}
                    onChange={(e) => updateProfile({ subject: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                    Education Level
                  </label>
                  <select
                    value={profile.level}
                    onChange={(e) => updateProfile({ level: e.target.value as EducationLevel })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="elementary">Elementary</option>
                    <option value="middle-school">Middle School</option>
                    <option value="high-school">High School</option>
                    <option value="college">College</option>
                    <option value="graduate">Graduate</option>
                    <option value="professional">Professional</option>
                    <option value="adult-learning">Adult Learning</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                    Teaching Style
                  </label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                    <select
                      value={profile.teachingStyle}
                      onChange={(e) => updateProfile({ teachingStyle: e.target.value as TeachingStyle })}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="traditional-lecture">Traditional Lecture</option>
                      <option value="constructivist">Constructivist</option>
                      <option value="direct-instruction">Direct Instruction</option>
                      <option value="inquiry-based">Inquiry-Based</option>
                      <option value="flipped-classroom">Flipped Classroom</option>
                      <option value="project-based">Project-Based</option>
                      <option value="competency-based">Competency-Based</option>
                      <option value="culturally-responsive">Culturally Responsive</option>
                      <option value="mixed-approach">Mixed Approach</option>
                    </select>
                    <button
                      onClick={() => setShowStyleDetector(true)}
                      style={{
                        padding: '12px 16px',
                        border: '1px solid #3b82f6',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      🎯 Detect Style
                    </button>
                  </div>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', margin: '8px 0 0 0' }}>
                    Not sure about your teaching style? Use our assessment tool to get personalized recommendations.
                  </p>
                </div>

                {shouldShowForComplexity('enhanced') && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                      AI Integration Preference
                    </label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                      <select
                        value={profile.aiPreference}
                        onChange={(e) => updateProfile({ aiPreference: e.target.value as AIIntegrationPreference })}
                        style={{
                          flex: 1,
                          padding: '12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '16px',
                          backgroundColor: 'white'
                        }}
                      >
                        <option value="ai-enhanced">🚀 AI-Enhanced (Use AI to enhance learning)</option>
                        <option value="ai-resistant">🛡️ AI-Resistant (Traditional methods emphasized)</option>
                        <option value="ai-literate">🎓 AI-Literate (Teaching about and with AI)</option>
                        <option value="mixed-approach">⚖️ Mixed Approach (Context-dependent)</option>
                        <option value="context-dependent">🎯 Context-Dependent (Varies by lesson)</option>
                      </select>
                      {shouldShowForComplexity('advanced') && (
                        <button
                          onClick={() => setShowAIWizard(true)}
                          style={{
                            padding: '12px 16px',
                            border: '1px solid #059669',
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          🤖 Configure AI
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', margin: '8px 0 0 0' }}>
                      {shouldShowForComplexity('advanced') 
                        ? 'Use the configuration wizard to set up detailed AI integration preferences for different content types.'
                        : 'Choose how you want AI to be integrated into your content generation process.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'defaults' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1e293b' }}>
                Content Generation Defaults
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                    Default Duration
                  </label>
                  <select
                    value={defaults.duration}
                    onChange={(e) => updateDefaults({ duration: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="30 minutes">30 minutes</option>
                    <option value="50 minutes">50 minutes</option>
                    <option value="75 minutes">75 minutes</option>
                    <option value="90 minutes">90 minutes</option>
                    <option value="2 hours">2 hours</option>
                    <option value="3 hours">3 hours</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                    Content Complexity
                  </label>
                  <select
                    value={defaults.complexity}
                    onChange={(e) => updateDefaults({ complexity: e.target.value as 'basic' | 'intermediate' | 'advanced' })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="basic">Basic</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500', color: '#374151' }}>
                    Default Content Types
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {['Slides', 'InstructorNotes', 'Worksheet', 'Quiz', 'ActivityGuide'].map(type => (
                      <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={defaults.contentTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateDefaults({ contentTypes: [...defaults.contentTypes, type] });
                            } else {
                              updateDefaults({ contentTypes: defaults.contentTypes.filter(t => t !== type) });
                            }
                          }}
                        />
                        <span>{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500', color: '#374151' }}>
                    Additional Options
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={defaults.includeAnswerKeys}
                        onChange={(e) => updateDefaults({ includeAnswerKeys: e.target.checked })}
                      />
                      <span>📋 Include Answer Keys</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={defaults.includeInstructorGuides}
                        onChange={(e) => updateDefaults({ includeInstructorGuides: e.target.checked })}
                      />
                      <span>📖 Include Instructor Guides</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={defaults.includeRubrics}
                        onChange={(e) => updateDefaults({ includeRubrics: e.target.checked })}
                      />
                      <span>📊 Include Rubrics</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={defaults.includeAccessibilityFeatures}
                        onChange={(e) => updateDefaults({ includeAccessibilityFeatures: e.target.checked })}
                      />
                      <span>♿ Accessibility Features</span>
                    </label>
                  </div>
                </div>

                {/* Answer Key Default Options */}
                {defaults.includeAnswerKeys && shouldShowForComplexity('enhanced') && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500', color: '#374151' }}>
                      🔑 Default Answer Key Options
                    </label>
                    <div style={{ display: 'grid', gap: '8px', marginLeft: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={defaults.answerKeyOptions?.includeExplanations ?? true}
                          onChange={(e) => updateDefaults({ 
                            answerKeyOptions: { 
                              ...defaults.answerKeyOptions, 
                              includeExplanations: e.target.checked 
                            } 
                          })}
                        />
                        <span style={{ fontSize: '14px' }}>Include detailed explanations for answers</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={defaults.answerKeyOptions?.includeDifficulty ?? true}
                          onChange={(e) => updateDefaults({ 
                            answerKeyOptions: { 
                              ...defaults.answerKeyOptions, 
                              includeDifficulty: e.target.checked 
                            } 
                          })}
                        />
                        <span style={{ fontSize: '14px' }}>Mark question difficulty levels</span>
                      </label>
                      {shouldShowForComplexity('advanced') && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={defaults.answerKeyOptions?.includePoints ?? false}
                            onChange={(e) => updateDefaults({ 
                              answerKeyOptions: { 
                                ...defaults.answerKeyOptions, 
                                includePoints: e.target.checked 
                              } 
                            })}
                          />
                          <span style={{ fontSize: '14px' }}>Suggest point values for each question</span>
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* Instructor Guide Default Options */}
                {defaults.includeInstructorGuides && shouldShowForComplexity('enhanced') && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500', color: '#374151' }}>
                      📖 Default Instructor Guide Options
                    </label>
                    <div style={{ display: 'grid', gap: '8px', marginLeft: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={defaults.instructorGuideOptions?.includeTiming ?? true}
                          onChange={(e) => updateDefaults({ 
                            instructorGuideOptions: { 
                              ...defaults.instructorGuideOptions, 
                              includeTiming: e.target.checked 
                            } 
                          })}
                        />
                        <span style={{ fontSize: '14px' }}>Suggested timing for each section</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={defaults.instructorGuideOptions?.includeGradingTips ?? true}
                          onChange={(e) => updateDefaults({ 
                            instructorGuideOptions: { 
                              ...defaults.instructorGuideOptions, 
                              includeGradingTips: e.target.checked 
                            } 
                          })}
                        />
                        <span style={{ fontSize: '14px' }}>Grading tips and common mistakes</span>
                      </label>
                      {shouldShowForComplexity('advanced') && (
                        <>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={defaults.instructorGuideOptions?.includeDiscussionPrompts ?? false}
                              onChange={(e) => updateDefaults({ 
                                instructorGuideOptions: { 
                                  ...defaults.instructorGuideOptions, 
                                  includeDiscussionPrompts: e.target.checked 
                                } 
                              })}
                            />
                            <span style={{ fontSize: '14px' }}>Discussion prompts for reviewing answers</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={defaults.instructorGuideOptions?.includeExtensions ?? false}
                              onChange={(e) => updateDefaults({ 
                                instructorGuideOptions: { 
                                  ...defaults.instructorGuideOptions, 
                                  includeExtensions: e.target.checked 
                                } 
                              })}
                            />
                            <span style={{ fontSize: '14px' }}>Extension activities for advanced students</span>
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1e293b' }}>
                Interface Preferences
              </h3>
              
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                    Form Complexity Level
                  </label>
                  <select
                    value={preferences.formComplexity}
                    onChange={(e) => updatePreferences({ formComplexity: e.target.value as 'simple' | 'detailed' | 'expert' })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="essential">⚡ Essential - Quick setup</option>
                    <option value="enhanced">⚙️ Enhanced - More control</option>
                    <option value="advanced">🔧 Advanced - Full options</option>
                  </select>
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: preferences.formComplexity === 'essential' ? '#f0fdf4' : 
                                   preferences.formComplexity === 'enhanced' ? '#fffbeb' : '#fef2f2',
                    border: `1px solid ${preferences.formComplexity === 'essential' ? '#bbf7d0' : 
                                        preferences.formComplexity === 'enhanced' ? '#fed7aa' : '#fecaca'}`,
                    borderRadius: '8px'
                  }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: preferences.formComplexity === 'essential' ? '#166534' : 
                             preferences.formComplexity === 'enhanced' ? '#92400e' : '#991b1b',
                      marginBottom: '4px'
                    }}>
                      {preferences.formComplexity === 'essential' && 'Essential Mode Active'}
                      {preferences.formComplexity === 'enhanced' && 'Enhanced Mode Active'}
                      {preferences.formComplexity === 'advanced' && 'Advanced Mode Active'}
                    </div>
                    <div style={{ 
                      fontSize: '13px', 
                      color: preferences.formComplexity === 'essential' ? '#166534' : 
                             preferences.formComplexity === 'enhanced' ? '#92400e' : '#991b1b',
                      lineHeight: '1.4'
                    }}>
                      {preferences.formComplexity === 'essential' && 
                        'Showing only core settings for quick setup. Switch to Enhanced or Advanced for more options.'}
                      {preferences.formComplexity === 'enhanced' && 
                        'Showing additional configuration options. Switch to Advanced for power user features.'}
                      {preferences.formComplexity === 'advanced' && 
                        'All settings and advanced tools are available. Perfect for power users who want full control.'}
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500', color: '#374151' }}>
                    Interface Options
                  </label>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={preferences.showAdvancedOptions}
                        onChange={(e) => updatePreferences({ showAdvancedOptions: e.target.checked })}
                      />
                      <span>🔧 Show advanced options by default</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={preferences.autoSaveSettings}
                        onChange={(e) => updatePreferences({ autoSaveSettings: e.target.checked })}
                      />
                      <span>💾 Auto-save settings changes</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={preferences.useSettingsByDefault}
                        onChange={(e) => updatePreferences({ useSettingsByDefault: e.target.checked })}
                      />
                      <span>⚙️ Use saved settings by default</span>
                    </label>
                  </div>
                </div>

                {shouldShowForComplexity('enhanced') && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500', color: '#374151' }}>
                      Advanced Tools
                    </label>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {shouldShowForComplexity('enhanced') && (
                        <button
                          onClick={() => setShowAIWizard(true)}
                          style={{
                            padding: '12px 16px',
                            border: '1px solid #059669',
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          🤖 Configure AI Integration
                        </button>
                      )}
                      {shouldShowForComplexity('advanced') && (
                        <>
                          <button
                            onClick={() => setShowTemplateEditor(true)}
                            style={{
                              padding: '12px 16px',
                              border: '1px solid #f59e0b',
                              backgroundColor: '#fef3c7',
                              color: '#92400e',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '500',
                              textAlign: 'left',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            🔧 Advanced Template Editor
                          </button>
                          <button
                            onClick={() => setShowLearningInsights(true)}
                            style={{
                              padding: '12px 16px',
                              border: '1px solid #8b5cf6',
                              backgroundColor: '#f3e8ff',
                              color: '#6b21a8',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '500',
                              textAlign: 'left',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            📊 Learning Insights
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Hidden Features Summary */}
                {preferences.formComplexity !== 'advanced' && (
                  <div style={{
                    marginTop: '24px',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px'
                    }}>
                      <span style={{ fontSize: '16px' }}>👀</span>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>
                        Hidden Features ({getHiddenFeaturesSummary().length})
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                      Switch to Enhanced or Advanced mode to access:
                    </div>
                    <div style={{ display: 'grid', gap: '4px' }}>
                      {getHiddenFeaturesSummary().map((feature, index) => (
                        <div key={index} style={{
                          fontSize: '12px',
                          color: '#9ca3af',
                          paddingLeft: '12px',
                          position: 'relative'
                        }}>
                          <span style={{
                            position: 'absolute',
                            left: '0',
                            color: '#d1d5db'
                          }}>
                            •
                          </span>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleExportSettings}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📤 Export
            </button>
            <label style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              📥 Import
              <input
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                border: '1px solid #d1d5db',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndClose}
              style={{
                padding: '12px 24px',
                border: 'none',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* Teaching Style Detection Modals */}
      <TeachingStyleDetector
        isOpen={showStyleDetector}
        onClose={() => setShowStyleDetector(false)}
        onStyleDetected={handleStyleDetected}
      />
      
      <TeachingStyleResults
        isOpen={showStyleResults}
        onClose={() => setShowStyleResults(false)}
        result={detectionResult}
        onAccept={handleAcceptStyle}
        onRetake={handleRetakeAssessment}
      />

      <AIIntegrationWizard
        isOpen={showAIWizard}
        onClose={() => setShowAIWizard(false)}
        onComplete={handleAIIntegrationComplete}
      />

      <AdvancedTemplateEditor
        isOpen={showTemplateEditor}
        onClose={() => setShowTemplateEditor(false)}
        contentTypes={['Slides', 'InstructorNotes', 'Worksheet', 'Quiz', 'ActivityGuide']}
        customContentTypes={state.settings?.advanced?.customContentTypes || []}
        onTemplateUpdated={handleTemplateUpdated}
      />

      <LearningInsights
        isOpen={showLearningInsights}
        onClose={() => setShowLearningInsights(false)}
      />
    </div>
  );
}