<?php
namespace UpliftersSiteBuilderBlocks\SecurityLayer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class SecuritySanitizer {
  public static function text($v): string {
    return sanitize_text_field($v);
  }

  /**
   * Allowed HTML for block render output that is assembled by this plugin's
   * own render.php templates (rendered inner blocks, generated menu markup,
   * inline SVG icons). This is not raw user input: every value placed into
   * that markup is escaped at the point it is built (esc_html/esc_attr/
   * esc_url) or comes from a fixed, developer-controlled source. This list
   * only guards against a render.php template accidentally emitting a tag
   * this plugin never intended to output, while still allowing the inline
   * styles, data-* mount hooks, embeds, and inline SVG icons the blocks rely on.
   *
   * @return array<string,array<string,bool>>
   */
  public static function rendered_block_allowed_html(): array {
    static $allowed_html = null;

    if ( null !== $allowed_html ) {
      return $allowed_html;
    }

    $allowed_html = wp_kses_allowed_html( 'post' );

    foreach ( $allowed_html as $tag => $attributes ) {
      $allowed_html[ $tag ]['class']  = true;
      $allowed_html[ $tag ]['id']     = true;
      $allowed_html[ $tag ]['style']  = true;
      $allowed_html[ $tag ]['data-*'] = true;
      $allowed_html[ $tag ]['aria-*'] = true;
      $allowed_html[ $tag ]['role']   = true;
    }

    $extra_tags = array(
      'iframe'   => array( 'src', 'width', 'height', 'title', 'loading', 'frameborder', 'allow', 'allowfullscreen', 'referrerpolicy', 'sandbox' ),
      'video'    => array( 'src', 'poster', 'controls', 'autoplay', 'loop', 'muted', 'playsinline', 'width', 'height', 'preload' ),
      'source'   => array( 'src', 'srcset', 'type', 'media' ),
      'svg'      => array( 'xmlns', 'viewbox', 'width', 'height', 'fill', 'stroke', 'stroke-width', 'aria-hidden', 'focusable' ),
      'path'     => array( 'd', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin' ),
      'circle'   => array( 'cx', 'cy', 'r', 'fill', 'stroke', 'stroke-width' ),
      'rect'     => array( 'x', 'y', 'rx', 'ry', 'width', 'height', 'fill', 'stroke' ),
      'line'     => array( 'x1', 'y1', 'x2', 'y2', 'stroke', 'stroke-width' ),
      'polyline' => array( 'points', 'fill', 'stroke', 'stroke-width' ),
      'polygon'  => array( 'points', 'fill', 'stroke', 'stroke-width' ),
      'g'        => array( 'fill', 'stroke', 'transform' ),
      'form'     => array( 'action', 'method', 'novalidate' ),
      'input'    => array( 'type', 'name', 'value', 'placeholder', 'required', 'checked', 'disabled', 'readonly', 'min', 'max', 'step', 'pattern', 'autocomplete' ),
      'textarea' => array( 'name', 'placeholder', 'required', 'rows', 'cols' ),
      'select'   => array( 'name', 'required', 'multiple' ),
      'option'   => array( 'value', 'selected' ),
      'label'    => array( 'for' ),
      'nav'      => array(),
    );

    foreach ( $extra_tags as $tag => $attribute_names ) {
      if ( ! isset( $allowed_html[ $tag ] ) ) {
        $allowed_html[ $tag ] = array();
      }

      foreach ( $attribute_names as $attribute_name ) {
        $allowed_html[ $tag ][ $attribute_name ] = true;
      }

      $allowed_html[ $tag ]['class']  = true;
      $allowed_html[ $tag ]['id']     = true;
      $allowed_html[ $tag ]['style']  = true;
      $allowed_html[ $tag ]['data-*'] = true;
      $allowed_html[ $tag ]['aria-*'] = true;
    }

    return $allowed_html;
  }
}
