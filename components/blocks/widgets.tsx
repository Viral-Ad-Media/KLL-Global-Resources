import type {
  ButtonBlock,
  HeadingBlock,
  HtmlBlock,
  IconBoxBlock,
  IconListBlock,
  ImageBlock,
  ImageBoxBlock,
  SpacerBlock,
  TabsBlock,
  TextBlock,
} from '@/lib/blocks';
import { Html } from './Html';
import { Img } from './Img';
import { Widget } from './Widget';

export function Heading({ id, classes, tag, size = 'default', text }: HeadingBlock) {
  return (
    <Widget id={id} type="heading" classes={classes}>
      <Html as={tag} className={`elementor-heading-title elementor-size-${size}`} html={text} />
    </Widget>
  );
}

export function RichText({ id, classes, html, as }: TextBlock) {
  return (
    <div
      className={['elementor-element', `elementor-element-${id}`, ...(classes ?? []), 'elementor-widget elementor-widget-text-editor'].join(' ')}
      data-id={id}
      data-element_type="widget"
      data-widget_type="text-editor.default"
    >
      {as === 'h1' ? (
        // The page's main heading. Same look as the plain eyebrow text (see .kll-page-title in site.css).
        <Html as="h1" className="elementor-widget-container kll-page-title" html={html} />
      ) : (
        <Html className="elementor-widget-container" html={html} />
      )}
    </div>
  );
}

export function Spacer({ id, classes }: SpacerBlock) {
  return (
    <Widget id={id} type="spacer" classes={classes}>
      <div className="elementor-spacer">
        <div className="elementor-spacer-inner" />
      </div>
    </Widget>
  );
}

export function HtmlEmbed({ id, classes, html }: HtmlBlock) {
  return (
    <div
      className={['elementor-element', `elementor-element-${id}`, ...(classes ?? []), 'elementor-widget elementor-widget-html'].join(' ')}
      data-id={id}
      data-element_type="widget"
      data-widget_type="html.default"
    >
      <Html className="elementor-widget-container" html={html} />
    </div>
  );
}

export function Button({ id, classes, text, href, size }: ButtonBlock) {
  return (
    <Widget id={id} type="button" classes={classes}>
      <div className="elementor-button-wrapper">
        <a className={`elementor-button elementor-button-link elementor-size-${size}`} href={href}>
          <span className="elementor-button-content-wrapper">
            <span className="elementor-button-text">{text}</span>
          </span>
        </a>
      </div>
    </Widget>
  );
}

export function Image({ id, classes, image }: ImageBlock) {
  return (
    <Widget id={id} type="image" classes={classes}>
      <Img image={image} />
    </Widget>
  );
}

/** Card with an optional icon/image, a title and a short description. */
export function ImageBox({ id, classes, image, titleTag, title, description }: ImageBoxBlock) {
  return (
    <Widget id={id} type="image-box" classes={classes}>
      <div className="elementor-image-box-wrapper">
        {image && (
          <figure className="elementor-image-box-img">
            <Img image={image} />
          </figure>
        )}
        <div className="elementor-image-box-content">
          <Html as={titleTag} className="elementor-image-box-title" html={title} />
          {description != null && <Html as="p" className="elementor-image-box-description" html={description} />}
        </div>
      </div>
    </Widget>
  );
}

/** Font Awesome icon with a title and description underneath. */
export function IconBox({ id, classes, icon, titleTag, title, description }: IconBoxBlock) {
  const Title = titleTag;
  return (
    <Widget id={id} type="icon-box" classes={classes}>
      <div className="elementor-icon-box-wrapper">
        <div className="elementor-icon-box-icon">
          <span className="elementor-icon elementor-animation-">
            <i aria-hidden="true" className={icon} />
          </span>
        </div>
        <div className="elementor-icon-box-content">
          <Title className="elementor-icon-box-title">
            <span>{title}</span>
          </Title>
          <p className="elementor-icon-box-description">{description}</p>
        </div>
      </div>
    </Widget>
  );
}

export function IconList({ id, classes, items }: IconListBlock) {
  return (
    <Widget id={id} type="icon-list" classes={classes}>
      <ul className="elementor-icon-list-items">
        {items.map((item, i) => (
          <li key={i} className="elementor-icon-list-item">
            <span className="elementor-icon-list-icon">
              <i aria-hidden="true" className={item.icon} />
            </span>
            <Html as="span" className="elementor-icon-list-text" html={item.text} />
          </li>
        ))}
      </ul>
    </Widget>
  );
}

/**
 * Tabs (desktop) that collapse into an accordion on mobile. Switching is handled client-side by
 * components/ElementorBehaviors.tsx; the first tab is open in the static HTML.
 */
export function Tabs({ id, classes, tabIdBase, tabs }: TabsBlock) {
  const tabId = (i: number) => `${tabIdBase}${i + 1}`;
  return (
    <Widget id={id} type="tabs" classes={classes}>
      <div className="elementor-tabs">
        <div className="elementor-tabs-wrapper" role="tablist">
          {tabs.map((t, i) => (
            <div
              key={i}
              id={`elementor-tab-title-${tabId(i)}`}
              className="elementor-tab-title elementor-tab-desktop-title"
              data-tab={i + 1}
              role="tab"
              tabIndex={i === 0 ? 0 : -1}
              aria-selected={i === 0}
              aria-controls={`elementor-tab-content-${tabId(i)}`}
            >
              {t.title}
            </div>
          ))}
        </div>
        <div className="elementor-tabs-content-wrapper" role="tablist" aria-orientation="vertical">
          {tabs.map((t, i) => [
            <div
              key={`t${i}`}
              className="elementor-tab-title elementor-tab-mobile-title"
              data-tab={i + 1}
              role="tab"
              tabIndex={i === 0 ? 0 : -1}
              aria-selected={i === 0}
              aria-controls={`elementor-tab-content-${tabId(i)}`}
            >
              {t.title}
            </div>,
            <div
              key={`c${i}`}
              id={`elementor-tab-content-${tabId(i)}`}
              className="elementor-tab-content elementor-clearfix"
              data-tab={i + 1}
              role="tabpanel"
              tabIndex={0}
              aria-labelledby={`elementor-tab-title-${tabId(i)}`}
              hidden={i !== 0}
              dangerouslySetInnerHTML={{ __html: t.html }}
            />,
          ])}
        </div>
      </div>
    </Widget>
  );
}
