import {createSignal, For, onMount, Show} from 'solid-js';
import ButtonMenuToggle from '@components/buttonMenuToggle';
import {AppPrivacyAndSecurityTab} from '@components/solidJsTabs/tabs';
import {AppChatFoldersTab} from '@components/solidJsTabs/tabs';
import {
  AppEditProfileTab,
  AppGeneralSettingsTab,
  AppKeyboardShortcutsTab,
  AppLanguageTab,
  AppNotificationsTab,
  AppSpeakersAndCameraTab,
  getEditProfileInitArgs
} from '@components/solidJsTabs';
import lottieLoader from '@lib/lottie/lottieLoader';
import {AppDataAndStorageTab} from '@components/solidJsTabs/tabs';
import ButtonIcon from '@components/buttonIcon';
import rootScope from '@lib/rootScope';
import Row from '@components/rowTsx';
import {AppActiveSessionsTab} from '@components/solidJsTabs/tabs';
import {i18n, LangPackKey} from '@lib/langPack';
import {SliderSuperTabConstructable, SliderSuperTabEventable} from '@components/sliderTab';
import {AccountAuthorizations, Authorization} from '@layer';
import PopupElement from '@components/popups';
import {attachClickEvent} from '@helpers/dom/clickEvent';
import Section from '@components/section';
import {AppStickersAndEmojiTab} from '@components/solidJsTabs/tabs';
import PopupPremium from '@components/popups/premium';
import apiManagerProxy from '@lib/apiManagerProxy';
import useStars from '@stores/stars';
import PopupStars from '@components/popups/stars';
import {renderPeerProfile} from '@components/peerProfile';
import SolidJSHotReloadGuardProvider from '@lib/solidjs/hotReloadGuardProvider';
import showPickUserPopup from '@components/popups/pickUser';
import showMyQrCodePopup from '@components/popups/myQrCode';
import PopupSendGift from '@components/popups/sendGift';
import {formatNanoton} from '@helpers/paymentsWrapCurrencyAmount';
import showLogOutPopup from '@components/popups/logOut';
import {useSuperTab} from '@components/solidJsTabs/superTabProvider';
import {usePromiseCollector} from '@components/solidJsTabs/promiseCollector';
import {subscribeOn} from '@helpers/solid/subscribeOn';

// ===== ✅ استيراد التبويب الجديد من solidJsTabs (بعد تعديل index.ts) =====
import {AppMetaFeaturesTab} from '@components/solidJsTabs';

// ─────────────────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────────────────

type SubTabConfig = {
  icon: Icon;
  text: LangPackKey;
  tabConstructor: SliderSuperTabConstructable;
  getInitArgs?: () => any[];
  args?: any;
};

const makeSubTabConfig = (
  icon: Icon,
  text: LangPackKey,
  tabConstructor: SliderSuperTabConstructable,
  fromTab: any
): SubTabConfig => {
  let getInitArgs: (() => any[]) | undefined;
  const g = (tabConstructor as any).getInitArgs;
  if(g) {
    getInitArgs = () => [g(fromTab)];
  }
  return {
    icon,
    text,
    tabConstructor,
    getInitArgs,
    args: getInitArgs?.()
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Settings Tab
// ─────────────────────────────────────────────────────────────────────────────

const Settings = () => {
  const promiseCollector = usePromiseCollector();
  const [tab] = useSuperTab();

  // ── Header (qr + edit + overflow menu)
  const qrBtn = ButtonIcon('qr');
  const editBtn = ButtonIcon('edit');
  const btnMenu = ButtonMenuToggle({
    listenerSetter: tab.listenerSetter,
    direction: 'bottom-left',
    buttons: [{
      icon: 'logout',
      text: 'EditAccount.Logout',
      onClick: () => showLogOutPopup()
    }]
  });

  onMount(() => {
    tab.container.classList.add('settings-container');
    tab.header.append(qrBtn, editBtn, btnMenu);
  });

  attachClickEvent(qrBtn, () => {
    showMyQrCodePopup();
  }, {listenerSetter: tab.listenerSetter});

  // ── Edit profile click
  let editProfileArgs: ReturnType<typeof getEditProfileInitArgs>;
  const refreshEditProfileArgs = () => {
    editProfileArgs = getEditProfileInitArgs();
  };
  refreshEditProfileArgs();
  attachClickEvent(editBtn, () => {
    tab.slider.createTab(AppEditProfileTab).open(editProfileArgs);
  }, {listenerSetter: tab.listenerSetter});

  subscribeOn(rootScope)('user_update', (userId) => {
    if(rootScope.myId.toUserId() === userId) {
      refreshEditProfileArgs();
    }
  });

  // ── Sub-tab rows
  const subTabConfigs: SubTabConfig[] = [
    makeSubTabConfig('unmute', 'AccountSettings.Notifications', AppNotificationsTab, tab),
    makeSubTabConfig('data', 'DataSettings', AppDataAndStorageTab, tab),
    makeSubTabConfig('lock', 'AccountSettings.PrivacyAndSecurity', AppPrivacyAndSecurityTab, tab),
    makeSubTabConfig('settings', 'Telegram.GeneralSettingsViewController', AppGeneralSettingsTab, tab),
    makeSubTabConfig('folder', 'AccountSettings.Filters', AppChatFoldersTab, tab),
    makeSubTabConfig('stickers_face', 'StickersName', AppStickersAndEmojiTab, tab),
    makeSubTabConfig('videocamera', 'AccountSettings.SpeakersAndCamera', AppSpeakersAndCameraTab, tab)
  ];

  const onSubTabClick = (item: SubTabConfig) => async() => {
    const args = item.args ? await item.args : [];
    const subTab = tab.slider.createTab(item.tabConstructor as any);
    subTab.open(...args);

    if(subTab instanceof SliderSuperTabEventable && item.getInitArgs) {
      (subTab as SliderSuperTabEventable).eventListener.addEventListener('destroyAfter', (promise) => {
        item.args = promise.then(() => item.getInitArgs() as any);
      });
    }
  };

  // ── Devices row
  let authorizations: Authorization.authorization[] | undefined;
  let getAuthorizationsPromise: Promise<AccountAuthorizations.accountAuthorizations> | undefined;
  const [authCount, setAuthCount] = createSignal('');

  const getAuthorizations = (overwrite?: boolean) => {
    if(getAuthorizationsPromise && !overwrite) return getAuthorizationsPromise;

    const promise = getAuthorizationsPromise = rootScope.managers.appAccountManager.getAuthorizations()
    .finally(() => {
      if(getAuthorizationsPromise === promise) {
        getAuthorizationsPromise = undefined;
      }
    });

    return promise;
  };

  const updateActiveSessions = (overwrite?: boolean) => {
    return getAuthorizations(overwrite).then((auths) => {
      authorizations = auths.authorizations;
      setAuthCount('' + authorizations.length);
    });
  };

  updateActiveSessions();

  const onDevicesClick = async() => {
    if(!authorizations) {
      await updateActiveSessions();
    }

    const subTab = tab.slider.createTab(AppActiveSessionsTab);
    subTab.eventListener.addEventListener('destroy', () => {
      authorizations = undefined;
      updateActiveSessions(true);
    }, {once: true});
    subTab.open({authorizations});
  };

  // ── Premium section
  const [premiumBlocked, setPremiumBlocked] = createSignal(false);
  promiseCollector.collect(
    Promise.resolve(apiManagerProxy.isPremiumPurchaseBlocked()).then(setPremiumBlocked)
  );

  const stars = useStars();
  const starsTon = useStars(true);

  // ── Self profile
  const peerProfileElement = renderPeerProfile({
    peerId: rootScope.myId,
    isDialog: false,
    scrollable: tab.scrollable,
    setCollapsedOn: tab.container,
    onAvatarReady: (promise) => promiseCollector.collect(promise)
  }, SolidJSHotReloadGuardProvider);

  lottieLoader.loadLottieWorkers();

  const onSendGiftClick = () => {
    showPickUserPopup({
      titleLangKey: 'SendGiftTo',
      placeholder: 'Chat.Menu.SendGift',
      selfPresence: 'SendGiftSelfCaption',
      meAsSaved: false,
      onSelect: (chosen) => {
        PopupElement.createPopup(PopupSendGift, {peerId: chosen[0].peerId});
      },
      filterPeerTypeBy: ['isRegularUser', 'isBroadcast']
    });
  };

  return (
    <>
      {peerProfileElement}
      
      {/* ===== القسم الأول: الإعدادات الأساسية ===== */}
      <Section>
        <div class="profile-buttons">
          <For each={subTabConfigs}>
            {(item) => (
              <Row clickable={onSubTabClick(item)}>
                <Row.Icon icon={item.icon} />
                <Row.Title>{i18n(item.text)}</Row.Title>
              </Row>
            )}
          </For>
          <Row clickable={onDevicesClick}>
            <Row.Icon icon="activesessions" />
            <Row.Title titleRight={<span>{authCount()}</span>} titleRightSecondary>
              {i18n('Devices')}
            </Row.Title>
          </Row>
          <Row clickable={() => tab.slider.createTab(AppLanguageTab).open()}>
            <Row.Icon icon="language" />
            <Row.Title titleRight={i18n('LanguageName')} titleRightSecondary>
              {i18n('AccountSettings.Language')}
            </Row.Title>
          </Row>
          <Row clickable={() => tab.slider.createTab(AppKeyboardShortcutsTab).open()}>
            <Row.Icon icon="keyboard" />
            <Row.Title>{i18n('KeyboardShortcuts.Title')}</Row.Title>
          </Row>
        </div>
      </Section>

      {/* ===== القسم الثاني: Premium ===== */}
      <Show when={!premiumBlocked()}>
        <Section>
          <Row clickable={() => PopupPremium.show()}>
            <Row.Icon icon="star" class="row-icon-premium-color" />
            <Row.Title>{i18n('Premium.Boarding.Title')}</Row.Title>
          </Row>

          <Show when={!!stars()}>
            <Row clickable={() => PopupElement.createPopup(PopupStars)}>
              <Row.Icon icon="star" class="row-icon-stars-color" />
              <Row.Title titleRight={'' + stars()} titleRightSecondary>
                {i18n('MenuTelegramStars')}
              </Row.Title>
            </Row>
          </Show>

          <Show when={String(starsTon()) !== '0'}>
            <Row clickable={() => PopupElement.createPopup(PopupStars, {ton: true})}>
              <Row.Icon icon="ton" />
              <Row.Title titleRight={formatNanoton(starsTon())} titleRightSecondary>
                {i18n('MenuTelegramStarsTon')}
              </Row.Title>
            </Row>
          </Show>

          <Row clickable={onSendGiftClick}>
            <Row.Icon icon="gift" />
            <Row.Title>{i18n('Chat.Menu.SendGift')}</Row.Title>
          </Row>
        </Section>
      </Show>

      {/* ===== ✅ القسم الثالث: زر الانتقال إلى تبويب مميزات Meta ===== */}
      <Section>
        <Row clickable={() => tab.slider.createTab(AppMetaFeaturesTab).open()}>
          <Row.Title>مميزات Meta المتقدمة</Row.Title>
        </Row>
      </Section>
    </>
  );
};

export default Settings;