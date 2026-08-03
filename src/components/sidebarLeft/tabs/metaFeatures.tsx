import Section from '@components/section';
import Row from '@components/rowTsx';
import {createSignal} from 'solid-js';

const MetaFeatures = () => {
  const [hideTyping, setHideTyping] = createSignal(false);
  const [ghostMode, setGhostMode] = createSignal(false);
  const [hideRead, setHideRead] = createSignal(false);
  const [hideOnline, setHideOnline] = createSignal(false);

  return (
    <>
      <Section>
        <Row clickable={() => setHideTyping(!hideTyping())}>
          <Row.Icon icon="privacy" />
          <Row.Title titleRight={hideTyping() ? 'مفعل' : 'متوقف'}>
            إخفاء جاري الكتابة
          </Row.Title>
        </Row>

        <Row clickable={() => setGhostMode(!ghostMode())}>
          <Row.Icon icon="lock" />
          <Row.Title titleRight={ghostMode() ? 'مفعل' : 'متوقف'}>
            وضع الشبح
          </Row.Title>
        </Row>
      </Section>

      <Section>
        <Row clickable={() => setHideRead(!hideRead())}>
          <Row.Icon icon="eye" />
          <Row.Title titleRight={hideRead() ? 'مفعل' : 'متوقف'}>
            إخفاء علامة القراءة
          </Row.Title>
        </Row>

        <Row clickable={() => setHideOnline(!hideOnline())}>
          <Row.Icon icon="user" />
          <Row.Title titleRight={hideOnline() ? 'مفعل' : 'متوقف'}>
            إخفاء الظهور
          </Row.Title>
        </Row>
      </Section>
    </>
  );
};

export default MetaFeatures;
