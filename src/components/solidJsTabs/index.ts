import {providedTabs} from '@components/solidJsTabs/providedTabs';
import {SuperTabProvider} from '@components/solidJsTabs/superTabProvider';
import {
  AppAddMembersTab,
  AppChatBackgroundTab,
  AppDirectMessagesTab,
  AppEditProfileTab,
  AppGeneralSettingsTab,
  AppKeyboardShortcutsTab,
  AppLanguageTab,
  AppNotificationsTab,
  AppPasscodeEnterPasswordTab,
  AppPasscodeLockTab,
  AppPrivacyMessagesTab,
  AppPasskeysTab,
  AppSettingsTab,
  AppSpeakersAndCameraTab,
  getEditProfileInitArgs
} from '@components/solidJsTabs/tabs';

// ===== ✅ استيراد التبويب الجديد =====
import {AppMetaFeaturesTab} from '@components/sidebarLeft/tabs/metaFeaturesTab';

SuperTabProvider.allTabs = providedTabs;

export {providedTabs};

export {
  AppAddMembersTab,
  AppChatBackgroundTab,
  AppDirectMessagesTab,
  AppEditProfileTab,
  AppGeneralSettingsTab,
  AppKeyboardShortcutsTab,
  AppLanguageTab,
  AppNotificationsTab,
  AppPasscodeEnterPasswordTab,
  AppPasscodeLockTab,
  AppPrivacyMessagesTab,
  AppPasskeysTab,
  AppSettingsTab,
  AppSpeakersAndCameraTab,
  getEditProfileInitArgs,
  // ===== ✅ تصدير التبويب الجديد =====
  AppMetaFeaturesTab
};
