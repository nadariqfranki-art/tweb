import {createSignal, For, onMount, Show, createEffect} from 'solid-js';
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
// ✅ Toggle Switch Component (زر أخضر متحرك)
// ─────────────────────────────────────────────────────────────────────────────

const ToggleSwitch = (props: { value: boolean; onChange: (val: boolean) => void }) => {
  const [isOn, setIsOn] = createSignal(props.value);

  createEffect(() => {
    setIsOn(props.value);
  });

  const handleClick = (e: Event) => {
    e.stopPropagation();
    const newVal = !isOn();
    setIsOn(newVal);
    props.onChange(newVal);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        width: '44px',
        height: '24px',
        background: isOn() ? 'var(--color-accent, #34a853)' : '#ccc',
        'border-radius': '12px',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.25s ease',
        'flex-shrink': '0',
        'box-shadow': 'inset 0 1px 3px rgba(0,0,0,0.2)'
      }}
    >
      <div
        style={{
          width: '20px',
          height: '20px',
          background: '#fff',
          'border-radius': '50%',
          position: 'absolute',
          top: '2px',
          left: isOn() ? '22px' : '2px',
          transition: 'left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          'box-shadow': '0 1px 4px rgba(0,0,0,0.3)'
        }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Settings Tab
// ─────────────────────────────────────────────────────────────────────────────

const Settings = () => {
  const promiseCollector = usePromiseCollector();
  const [tab] = useSuperTab();

  // ===== ✅ تعريف Signals المميزات =====
  const [antiScreenshot, setAntiScreenshot] = createSignal(false);
  const [readReceipts, setReadReceipts] = createSignal(false);
  const [hdUploads, setHdUploads] = createSignal(false);
  const [autoDownload, setAutoDownload] = createSignal(false);
  const [devMode, setDevMode] = createSignal(false);
  const [nightMode, setNightMode] = createSignal(false);

  // ===== ✅ دوال تفعيل الميزات =====
  const toggleAntiScreenshot = (val: boolean) => {
    setAntiScreenshot(val);
    if (val) {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      document.addEventListener('contextmenu', (e) => e.preventDefault());
    } else {
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.removeEventListener('contextmenu', (e) => e.preventDefault());
    }
    localStorage.setItem('antiScreenshot', JSON.stringify(val));
  };

  const toggleReadReceipts = (val: boolean) => {
    setReadReceipts(val);
    localStorage.setItem('readReceipts', JSON.stringify(val));
  };

  const toggleHdUploads = (val: boolean) => {
    setHdUploads(val);
    localStorage.setItem('hdUploads', JSON.stringify(val));
  };

  const toggleAutoDownload = (val: boolean) => {
    setAutoDownload(val);
    localStorage.setItem('autoDownload', JSON.stringify(val));
  };

  const toggleDevMode = (val: boolean) => {
    setDevMode(val);
    localStorage.setItem('devMode', JSON.stringify(val));
  };

  const toggleNightMode = (val: boolean) => {
    setNightMode(val);
    if (val) {
      document.documentElement.style.setProperty('--color-bg', '#1a1a2e');
      document.documentElement.style.setProperty('--color-text', '#ffffff');
    } else {
      document.documentElement.style.setProperty('--color-bg', '');
      document.documentElement.style.setProperty('--color-text', '');
    }
    localStorage.setItem('nightMode', JSON.stringify(val));
  };

  // ===== ✅ استعادة الإعدادات من localStorage =====
  onMount(() => {
    const savedAnti = localStorage.getItem('antiScreenshot');
    if (savedAnti !== null) setAntiScreenshot(JSON.parse(savedAnti));
    const savedRead = localStorage.getItem('readReceipts');
    if (savedRead !== null) setReadReceipts(JSON.parse(savedRead));
    const savedHd = localStorage.getItem('hdUploads');
    if (savedHd !== null) setHdUploads(JSON.parse(savedHd));
    const savedAuto = localStorage.getItem('autoDownload');
    if (savedAuto !== null) setAutoDownload(JSON.parse(savedAuto));
    const savedDev = localStorage.getItem('devMode');
    if (savedDev !== null) setDevMode(JSON.parse(savedDev));
    const savedNight = localStorage.getItem('nightMode');
    if (savedNight !== null) setNightMode(JSON.parse(savedNight));
  });

  // ── Header
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

  // Edit profile
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

  // Sub-tabs
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

  // Devices
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

  // Premium
  const [premiumBlocked, setPremiumBlocked] = createSignal(false);
  promiseCollector.collect(
    Promise.resolve(apiManagerProxy.isPremiumPurchaseBlocked()).then(setPremiumBlocked)
  );

  const stars = useStars();
  const starsTon = useStars(true);

  // Profile
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

      {/* ===== ✅ القسم الثالث: مميزات Meta ===== */}
      <Section>
        <div style={{
          padding: '12px 16px 8px 16px',
          'font-weight': '700',
          'font-size': '15px',
          color: 'var(--color-accent)',
          'border-bottom': '1px solid var(--color-border)',
          'margin-bottom': '4px',
          animation: 'fadeInDown 0.4s ease'
        }}>
          ✦ مميزات Meta المتقدمة
        </div>

        <div style={{ animation: 'slideUp 0.35s ease' }}>
          
          {/* ميزة 1: حماية المحادثات */}
          <Row>
            <Row.Icon icon="lock" />
            <Row.Title
              titleRight={
                <ToggleSwitch
                  value={antiScreenshot()}
                  onChange={toggleAntiScreenshot}
                />
              }
              titleRightSecondary
            >
              <div style={{ 'font-weight': '500' }}>حماية محادثات Meta</div>
              <div style={{
                'font-size': '12px',
                color: 'var(--color-text-secondary)',
                opacity: 0.7,
                'margin-top': '2px',
                'font-weight': 'normal'
              }}>
                منع الآخرين من أخذ لقطة شاشة للمحادثات أو التسجيل.
              </div>
            </Row.Title>
          </Row>

          {/* ميزة 2: إخفاء علامة القراءة */}
          <Row>
            <Row.Icon icon="unmute" />
            <Row.Title
              titleRight={
                <ToggleSwitch
                  value={readReceipts()}
                  onChange={toggleReadReceipts}
                />
              }
              titleRightSecondary
            >
              <div style={{ 'font-weight': '500' }}>إخفاء علامة القراءة</div>
              <div style={{
                'font-size': '12px',
                color: 'var(--color-text-secondary)',
                opacity: 0.7,
                'margin-top': '2px',
                'font-weight': 'normal'
              }}>
                قراءة الرسائل دون أن يظهر للطرف الآخر أنك قرأتها.
              </div>
            </Row.Title>
          </Row>

          {/* ميزة 3: رفع الوسائط بجودة HD */}
          <Row>
            <Row.Icon icon="data" />
            <Row.Title
              titleRight={
                <ToggleSwitch
                  value={hdUploads()}
                  onChange={toggleHdUploads}
                />
              }
              titleRightSecondary
            >
              <div style={{ 'font-weight': '500' }}>رفع الوسائط بجودة HD</div>
              <div style={{
                'font-size': '12px',
                color: 'var(--color-text-secondary)',
                opacity: 0.7,
                'margin-top': '2px',
                'font-weight': 'normal'
              }}>
                إرسال الصور والفيديوهات بأعلى جودة ممكنة تلقائياً.
              </div>
            </Row.Title>
          </Row>

          {/* ميزة 4: تحميل تلقائي للوسائط */}
          <Row>
            <Row.Icon icon="download" />
            <Row.Title
              titleRight={
                <ToggleSwitch
                  value={autoDownload()}
                  onChange={toggleAutoDownload}
                />
              }
              titleRightSecondary
            >
              <div style={{ 'font-weight': '500' }}>تحميل تلقائي للوسائط</div>
              <div style={{
                'font-size': '12px',
                color: 'var(--color-text-secondary)',
                opacity: 0.7,
                'margin-top': '2px',
                'font-weight': 'normal'
              }}>
                تحميل الصور والفيديوهات تلقائياً عند فتح المحادثة.
              </div>
            </Row.Title>
          </Row>

          {/* ميزة 5: وضع المطور */}
          <Row>
            <Row.Icon icon="settings" />
            <Row.Title
              titleRight={
                <ToggleSwitch
                  value={devMode()}
                  onChange={toggleDevMode}
                />
              }
              titleRightSecondary
            >
              <div style={{ 'font-weight': '500' }}>وضع المطور</div>
              <div style={{
                'font-size': '12px',
                color: 'var(--color-text-secondary)',
                opacity: 0.7,
                'margin-top': '2px',
                'font-weight': 'normal'
              }}>
                إظهار خيارات متقدمة للمطورين وبيانات إضافية.
              </div>
            </Row.Title>
          </Row>

          {/* ميزة 6: الوضع الليلي (بدون أيقونة) */}
          <Row>
            <Row.Title
              titleRight={
                <ToggleSwitch
                  value={nightMode()}
                  onChange={toggleNightMode}
                />
              }
              titleRightSecondary
            >
              <div style={{ 'font-weight': '500' }}>الوضع الليلي الذكي</div>
              <div style={{
                'font-size': '12px',
                color: 'var(--color-text-secondary)',
                opacity: 0.7,
                'margin-top': '2px',
                'font-weight': 'normal'
              }}>
                تغيير ثيم التطبيق تلقائياً حسب وقت اليوم.
              </div>
            </Row.Title>
          </Row>

        </div>
      </Section>

      {/* ===== CSS للـ Animations ===== */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default Settings;