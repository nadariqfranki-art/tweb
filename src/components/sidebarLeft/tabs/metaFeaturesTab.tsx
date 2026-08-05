import {createSignal, onMount, createEffect} from 'solid-js';
import SliderSuperTab from '@components/sliderTab';
import Row from '@components/rowTsx';
import Section from '@components/section';

// ============================================================
// ✅ Toggle Switch Component (زر أخضر متحرك)
// ============================================================
const ToggleSwitch = (props: { value: boolean; onChange: (val: boolean) => void }) => {
  const [isOn, setIsOn] = createSignal(props.value);

  createEffect(() => {
    setIsOn(props.value);
  });

  const handleClick = (e: Event) => {
    e.stopPropagation();
    e.preventDefault();
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

// ============================================================
// ✅ Signals المميزات (مشتركة مع التطبيق)
// ============================================================
export const [antiScreenshot, setAntiScreenshot] = createSignal(false);
export const [readReceipts, setReadReceipts] = createSignal(false);
export const [hdUploads, setHdUploads] = createSignal(false);
export const [autoDownload, setAutoDownload] = createSignal(false);
export const [devMode, setDevMode] = createSignal(false);
export const [nightMode, setNightMode] = createSignal(false);

// ============================================================
// ✅ دوال تفعيل الميزات (تفاعل فعلي)
// ============================================================
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
    document.documentElement.style.setProperty('--color-text-secondary', '#aaaaaa');
    document.documentElement.style.setProperty('--color-border', '#333355');
  } else {
    document.documentElement.style.setProperty('--color-bg', '');
    document.documentElement.style.setProperty('--color-text', '');
    document.documentElement.style.setProperty('--color-text-secondary', '');
    document.documentElement.style.setProperty('--color-border', '');
  }
  localStorage.setItem('nightMode', JSON.stringify(val));
};

// ============================================================
// ✅ واجهة المميزات (SliderSuperTab - Class مع Constructor صحيح)
// ============================================================
export class AppMetaFeaturesTab extends SliderSuperTab {
  static id = 'meta_features';
  
  constructor(args?: any) {
    super(args || {
      id: 'meta_features',
      getHeader: () => ({ text: 'مميزات Meta' })
    });
  }

  // دالة render الخاصة بالتبويب
  render() {
    // استعادة الإعدادات من localStorage عند تحميل التبويب
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

    return (
      <div style={{ padding: '8px 0' }}>
        <Section>
          {/* عنوان القسم */}
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

          {/* المميزات */}
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
      </div>
    );
  }
}

// ============================================================
// ✅ تصدير مثيل (Instance) للاستخدام في createTab
// ============================================================
export const appMetaFeaturesTab = new AppMetaFeaturesTab();
