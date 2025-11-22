
import React, { useState } from 'react';
import { UserSettings, EpiphanyStyle, AppTheme, EpiphanyResult, EmailFrequency, EmailContent } from '../types';
import { Save, Trash2, Download, Monitor, Type, Bell, Eye, Globe, Palette, Mail, Clock, Check } from 'lucide-react';
import { requestNotificationPermission, sendBrowserNotification, simulateSendEmail } from '../services/notificationService';

interface Props {
  settings: UserSettings;
  onSave: (newSettings: UserSettings) => void;
  history: EpiphanyResult[];
  onDeleteAccount: () => void;
  onTestEmail: (type: 'daily' | 'weekly') => void;
}

export const SettingsPage: React.FC<Props> = ({ settings, onSave, history, onDeleteAccount, onTestEmail }) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  const handleChange = (key: keyof UserSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(localSettings);
    setHasChanges(false);
  };

  const handleNotificationToggle = async (checked: boolean) => {
    if (checked) {
      const granted = await requestNotificationPermission();
      if (granted) {
        handleChange('browserNotifications', true);
        sendBrowserNotification("Notifications Enabled", "You will be reminded to observe the world daily.");
      } else {
        // Permission denied logic could go here (e.g. show toast)
        handleChange('browserNotifications', false);
      }
    } else {
      handleChange('browserNotifications', false);
    }
  };

  const handleTriggerTestEmail = async () => {
    setIsTestingEmail(true);
    await onTestEmail(localSettings.emailFrequency === 'none' ? 'daily' : localSettings.emailFrequency as 'daily' | 'weekly');
    setIsTestingEmail(false);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'my-epiphanies.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-20 animate-fade-in">
      <h1 className="text-3xl serif font-bold text-white mb-8 text-center md:text-left">Settings</h1>

      <div className="space-y-8">
        
        {/* Style Preference */}
        <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4 text-indigo-300">
            <Palette className="w-5 h-5" />
            <h2 className="text-lg font-bold uppercase tracking-wide">Epiphany Style</h2>
          </div>
          <p className="text-slate-400 text-sm mb-4">Choose the voice of your cosmic revelations.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['poetic', 'scientific', 'philosophical', 'spiritual', 'humorous'] as EpiphanyStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => handleChange('style', style)}
                className={`px-4 py-3 rounded-lg text-sm font-medium capitalize transition-all border ${
                  localSettings.style === style 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/50' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </section>

        {/* Email Subscriptions */}
        <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-2 text-indigo-300">
               <Mail className="w-5 h-5" />
               <h2 className="text-lg font-bold uppercase tracking-wide">Email Subscriptions</h2>
             </div>
             <button 
               onClick={handleTriggerTestEmail}
               disabled={isTestingEmail}
               className="text-xs text-indigo-400 hover:text-indigo-300 underline decoration-indigo-500/30"
             >
               {isTestingEmail ? 'Sending...' : 'Send Test Email'}
             </button>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Frequency</label>
                <div className="flex flex-col gap-2">
                  {(['daily', 'weekly', 'none'] as EmailFrequency[]).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => handleChange('emailFrequency', freq)}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm border transition-all ${
                        localSettings.emailFrequency === freq 
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200' 
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <span className="capitalize">{freq} Digest</span>
                      {localSettings.emailFrequency === freq && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Content Preference</label>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'favorites', label: 'My Favorites', desc: 'Rediscover your saved epiphanies' },
                    { id: 'community', label: 'Community Best', desc: 'Epiphany of the Day from others' },
                    { id: 'random', label: 'Random Inspiration', desc: 'Surprise cosmic connections' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleChange('emailContent', item.id)}
                      disabled={localSettings.emailFrequency === 'none'}
                      className={`text-left px-4 py-2 rounded-lg text-sm border transition-all ${
                        localSettings.emailContent === item.id && localSettings.emailFrequency !== 'none'
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200' 
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs opacity-70">{item.desc}</div>
                    </button>
                  ))}
                </div>
             </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6 text-indigo-300">
            <Bell className="w-5 h-5" />
            <h2 className="text-lg font-bold uppercase tracking-wide">Notifications</h2>
          </div>
          
          <div className="space-y-4">
             <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3">
                   <Monitor className="w-5 h-5 text-slate-400" />
                   <div>
                      <div className="text-sm font-medium text-slate-200">Browser Notifications</div>
                      <div className="text-xs text-slate-500">Receive a reminder on your device</div>
                   </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={localSettings.browserNotifications} 
                    onChange={(e) => handleNotificationToggle(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
             </div>

             {localSettings.browserNotifications && (
               <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700 animate-fade-in">
                  <div className="flex items-center gap-3">
                     <Clock className="w-5 h-5 text-slate-400" />
                     <div>
                        <div className="text-sm font-medium text-slate-200">Reminder Time</div>
                        <div className="text-xs text-slate-500">When should we remind you?</div>
                     </div>
                  </div>
                  <input 
                    type="time" 
                    value={localSettings.notificationTime}
                    onChange={(e) => handleChange('notificationTime', e.target.value)}
                    className="bg-slate-800 border border-slate-600 rounded p-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
               </div>
             )}
          </div>
        </section>

        {/* Appearance & Privacy */}
        <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6 text-indigo-300">
            <Monitor className="w-5 h-5" />
            <h2 className="text-lg font-bold uppercase tracking-wide">Appearance & Privacy</h2>
          </div>
          
          <div className="space-y-6">
            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Theme</label>
              <div className="flex gap-3">
                {(['cosmic', 'dark', 'light'] as AppTheme[]).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => handleChange('theme', theme)}
                    className={`flex-1 py-2 rounded-lg text-sm border capitalize transition-colors ${
                      localSettings.theme === theme
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
               <label className="block text-sm font-medium text-slate-300 mb-2">Font Size</label>
               <div className="flex items-center gap-4 bg-slate-900 rounded-lg p-3 border border-slate-700">
                 <Type className="w-4 h-4 text-slate-500" />
                 <input 
                   type="range" 
                   min="0" 
                   max="2" 
                   step="1"
                   value={localSettings.fontSize === 'small' ? 0 : localSettings.fontSize === 'medium' ? 1 : 2}
                   onChange={(e) => {
                     const val = parseInt(e.target.value);
                     const size = val === 0 ? 'small' : val === 1 ? 'medium' : 'large';
                     handleChange('fontSize', size);
                   }}
                   className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                 />
                 <span className="text-xs text-slate-400 uppercase min-w-[3rem] text-right">{localSettings.fontSize}</span>
               </div>
            </div>

             <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3">
                   <Eye className="w-5 h-5 text-slate-400" />
                   <div>
                      <div className="text-sm font-medium text-slate-200">Public Profile</div>
                      <div className="text-xs text-slate-500">Allow your epiphanies to be seen in Community</div>
                   </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={localSettings.isPublic} 
                    onChange={(e) => handleChange('isPublic', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
             </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
           <h2 className="text-lg font-bold uppercase tracking-wide text-indigo-300 mb-6">Data Management</h2>
           
           <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button 
                onClick={handleExportJSON}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
              >
                 <Download className="w-4 h-4" />
                 Export JSON
              </button>
              <button 
                onClick={handleExportPDF}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
              >
                 <Download className="w-4 h-4" />
                 Print / Save PDF
              </button>
           </div>

           <div className="pt-6 border-t border-slate-700/50">
              {!showDeleteConfirm ? (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                >
                   <Trash2 className="w-4 h-4" />
                   Delete Account & Data
                </button>
              ) : (
                <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4">
                   <p className="text-red-200 text-sm mb-3">Are you sure? This action cannot be undone.</p>
                   <div className="flex gap-3">
                      <button 
                        onClick={onDeleteAccount}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded transition-colors"
                      >
                        Confirm Delete
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3 py-1.5 bg-transparent border border-slate-600 text-slate-400 hover:text-white text-xs font-bold rounded transition-colors"
                      >
                        Cancel
                      </button>
                   </div>
                </div>
              )}
           </div>
        </section>

        {/* Save Action */}
        <div className="sticky bottom-6 flex justify-end">
           <button
             onClick={handleSave}
             disabled={!hasChanges}
             className={`flex items-center gap-2 px-6 py-3 rounded-xl shadow-xl font-bold transition-all transform ${
               hasChanges 
                 ? 'bg-indigo-600 hover:bg-indigo-500 text-white translate-y-0 opacity-100' 
                 : 'bg-slate-700 text-slate-500 translate-y-10 opacity-0 pointer-events-none'
             }`}
           >
              <Save className="w-5 h-5" />
              Save Changes
           </button>
        </div>

      </div>
    </div>
  );
};
