<?php
/** Server-side render for the UpliftersSiteBuilderBlocks Team Members block. */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'uplifters_site_builder_blocks_team_member_responsive_value' ) ) {
  function uplifters_site_builder_blocks_team_member_responsive_value( array $attributes, string $key, string $device, $fallback = '' ) {
    if ( ! isset( $attributes[ $key ] ) ) { return $fallback; }
    $value = $attributes[ $key ];
    if ( is_array( $value ) ) {
      if ( array_key_exists( $device, $value ) && '' !== $value[ $device ] && null !== $value[ $device ] ) { return $value[ $device ]; }
      foreach ( array( 'desktop', 'tablet', 'mobile' ) as $fallback_device ) {
        if ( array_key_exists( $fallback_device, $value ) && '' !== $value[ $fallback_device ] && null !== $value[ $fallback_device ] ) { return $value[ $fallback_device ]; }
      }
    }
    return ! is_array( $value ) && '' !== $value && null !== $value ? $value : $fallback;
  }
}

if ( ! function_exists( 'uplifters_site_builder_blocks_team_member_responsive_box_value' ) ) {
  function uplifters_site_builder_blocks_team_member_responsive_box_value( array $attributes, string $key, string $device ) {
    $empty = array( 'top' => '', 'right' => '', 'bottom' => '', 'left' => '' );
    if ( empty( $attributes[ $key ] ) || ! is_array( $attributes[ $key ] ) ) { return $empty; }
    $value = $attributes[ $key ];
    $branch = isset( $value[ $device ] ) && is_array( $value[ $device ] ) ? $value[ $device ] : ( isset( $value['desktop'] ) && is_array( $value['desktop'] ) ? $value['desktop'] : $empty );
    return array_merge( $empty, $branch );
  }
}

if ( ! function_exists( 'uplifters_site_builder_blocks_team_member_sanitize_css_value' ) ) {
  function uplifters_site_builder_blocks_team_member_sanitize_css_value( $value ) : string {
    return trim( str_replace( array( '<', '>', '{', '}', ';' ), '', wp_strip_all_tags( (string) $value ) ) );
  }
}
if ( ! function_exists( 'uplifters_site_builder_blocks_team_member_sanitize_color' ) ) {
  function uplifters_site_builder_blocks_team_member_sanitize_color( $value ) : string {
    $value = trim( (string) $value );
    return preg_match( '/^#[a-fA-F0-9]{3,8}$|^rgb[a]?\([0-9.,\s%]+\)$/', $value ) ? $value : '';
  }
}
if ( ! function_exists( 'uplifters_site_builder_blocks_team_member_box_to_css' ) ) {
  function uplifters_site_builder_blocks_team_member_box_to_css( string $prefix, array $box ) : string {
    $css = '';
    foreach ( array( 'top', 'right', 'bottom', 'left' ) as $side ) {
      $value = isset( $box[ $side ] ) ? uplifters_site_builder_blocks_team_member_sanitize_css_value( $box[ $side ] ) : '';
      if ( '' !== $value ) { $css .= $prefix . '-' . $side . ':' . $value . ';'; }
    }
    return $css;
  }
}
if ( ! function_exists( 'uplifters_site_builder_blocks_team_member_shadow_css' ) ) {
  function uplifters_site_builder_blocks_team_member_shadow_css( $level ) : string {
    $level = is_numeric( $level ) ? (float) $level : 8;
    if ( $level <= 0 ) { return 'none'; }
    return sprintf( '0 %1$spx %2$spx 0 rgba(0,0,0,%3$.2f)', round( $level * 1.5 ), round( $level * 4 ), max( .06, min( .22, $level / 50 ) ) );
  }
}

$uplifters_site_builder_blocks_cards = isset( $attributes['cards'] ) && is_array( $attributes['cards'] ) ? $attributes['cards'] : array();
// Backward compatibility for blocks saved with the previous single-card attributes.
if ( empty( $uplifters_site_builder_blocks_cards ) ) {
  $uplifters_site_builder_blocks_cards[] = array(
    'imageUrl' => $attributes['imageUrl'] ?? '', 'imageAlt' => $attributes['imageAlt'] ?? '',
    'name' => $attributes['name'] ?? 'John Doe', 'designation' => $attributes['designation'] ?? 'Designation',
    'content' => $content,
  );
}

$uplifters_site_builder_blocks_unique_id = wp_unique_id( 'uplifters-site-builder-blocks-team-member-' );
$uplifters_site_builder_blocks_devices = array();
foreach ( array( 'desktop', 'tablet', 'mobile' ) as $uplifters_site_builder_blocks_device ) {
  $uplifters_site_builder_blocks_font_family_key             = (string) uplifters_site_builder_blocks_team_member_responsive_value( $attributes, 'fontFamily', $uplifters_site_builder_blocks_device, 'default' );
  $uplifters_site_builder_blocks_name_font_family_key        = (string) uplifters_site_builder_blocks_team_member_responsive_value( $attributes, 'nameFontFamily', $uplifters_site_builder_blocks_device, 'default' );
  $uplifters_site_builder_blocks_designation_font_family_key = (string) uplifters_site_builder_blocks_team_member_responsive_value( $attributes, 'designationFontFamily', $uplifters_site_builder_blocks_device, 'default' );

  $uplifters_site_builder_blocks_devices[ $uplifters_site_builder_blocks_device ] = array(
    'columns' => max( 1, min( 6, absint( uplifters_site_builder_blocks_team_member_responsive_value( $attributes, 'cardColumns', $uplifters_site_builder_blocks_device, 'desktop' === $uplifters_site_builder_blocks_device ? 3 : ( 'tablet' === $uplifters_site_builder_blocks_device ? 2 : 1 ) ) ) ) ),
    'image_width' => max( 1, absint( uplifters_site_builder_blocks_team_member_responsive_value( $attributes, 'imageWidth', $uplifters_site_builder_blocks_device, 112 ) ) ),
    'image_height' => max( 1, absint( uplifters_site_builder_blocks_team_member_responsive_value( $attributes, 'imageHeight', $uplifters_site_builder_blocks_device, 112 ) ) ),
    'card_shadow' => uplifters_site_builder_blocks_team_member_shadow_css( uplifters_site_builder_blocks_team_member_responsive_value( $attributes, 'cardShadow', $uplifters_site_builder_blocks_device, 8 ) ),
    'font_family' => \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_font_family_key ) ?: 'inherit',
    'name_font_family' => \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_name_font_family_key ) ?: 'inherit',
    'designation_font_family' => \UpliftersSiteBuilderBlocks\AssetsEnqueue\FontsRegister::get_css_stack( $uplifters_site_builder_blocks_designation_font_family_key ) ?: 'inherit',
    'name_font_size' => max( 1, absint( uplifters_site_builder_blocks_team_member_responsive_value( $attributes, 'nameFontSize', $uplifters_site_builder_blocks_device, 20 ) ) ),
    'designation_font_size' => max( 1, absint( uplifters_site_builder_blocks_team_member_responsive_value( $attributes, 'designationFontSize', $uplifters_site_builder_blocks_device, 14 ) ) ),
    'name_color' => uplifters_site_builder_blocks_team_member_sanitize_color( uplifters_site_builder_blocks_team_member_responsive_value( $attributes, 'nameColor', $uplifters_site_builder_blocks_device, '#0f172a' ) ),
    'designation_color' => uplifters_site_builder_blocks_team_member_sanitize_color( uplifters_site_builder_blocks_team_member_responsive_value( $attributes, 'designationColor', $uplifters_site_builder_blocks_device, '#475569' ) ),
    'background_color' => uplifters_site_builder_blocks_team_member_sanitize_color( uplifters_site_builder_blocks_team_member_responsive_value( $attributes, 'backgroundColor', $uplifters_site_builder_blocks_device, '#fff' ) ),
    'content_background_color' => uplifters_site_builder_blocks_team_member_sanitize_color( uplifters_site_builder_blocks_team_member_responsive_value( $attributes, 'contentBackgroundColor', $uplifters_site_builder_blocks_device, '#f1f5f9' ) ),
    'padding' => uplifters_site_builder_blocks_team_member_responsive_box_value( $attributes, 'padding', $uplifters_site_builder_blocks_device ),
    'margin' => uplifters_site_builder_blocks_team_member_responsive_box_value( $attributes, 'margin', $uplifters_site_builder_blocks_device ),
    'gap' => max( 0, absint( uplifters_site_builder_blocks_team_member_responsive_value( $attributes, 'gap', $uplifters_site_builder_blocks_device, 24 ) ) ),
    'max_width' => uplifters_site_builder_blocks_team_member_sanitize_css_value( uplifters_site_builder_blocks_team_member_responsive_value( $attributes, 'maxWidth', $uplifters_site_builder_blocks_device, '24rem' ) ),
  );
}

$uplifters_site_builder_blocks_wrapper_attributes = get_block_wrapper_attributes( array( 'id' => $uplifters_site_builder_blocks_unique_id, 'class' => 'uplifters-site-builder-blocks-team-member' ) );
$uplifters_site_builder_blocks_static_css = '.uplifters-site-builder-blocks-team-member{width:100%;box-sizing:border-box}.uplifters-site-builder-blocks-team-member *{box-sizing:border-box}.uplifters-site-builder-blocks-team-member__grid{display:grid;width:100%}.uplifters-site-builder-blocks-team-member__card{width:100%;justify-self:center;border-radius:16px;text-align:center;display:flex;flex-direction:column;align-items:center;border:1px solid rgba(0,0,0,.06)}.uplifters-site-builder-blocks-team-member__image-wrap{border-radius:9999px;overflow:hidden;background:rgba(148,163,184,.2);border:1px solid rgba(0,0,0,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0}.uplifters-site-builder-blocks-team-member__image{width:100%;height:100%;display:block;object-fit:cover}.uplifters-site-builder-blocks-team-member__image-placeholder{font-size:13px;color:#64748b}.uplifters-site-builder-blocks-team-member__name{margin:8px 0 0;line-height:1.2;font-weight:600}.uplifters-site-builder-blocks-team-member__designation{margin:0;line-height:1.4;font-weight:500}.uplifters-site-builder-blocks-team-member__content{width:100%;margin-top:4px;padding:16px;text-align:left;border-radius:12px;border:1px solid rgba(0,0,0,.05)}';
$uplifters_site_builder_blocks_build_css = static function( string $selector, array $v ) : string {
  $css = $selector . ' .uplifters-site-builder-blocks-team-member__grid{grid-template-columns:repeat(' . $v['columns'] . ',minmax(0,1fr));gap:' . $v['gap'] . 'px;}';
  $css .= $selector . ' .uplifters-site-builder-blocks-team-member__card{max-width:' . $v['max_width'] . ';background-color:' . $v['background_color'] . ';box-shadow:' . $v['card_shadow'] . ';font-family:' . $v['font_family'] . ';' . uplifters_site_builder_blocks_team_member_box_to_css( 'padding', $v['padding'] ) . uplifters_site_builder_blocks_team_member_box_to_css( 'margin', $v['margin'] ) . '}';
  $css .= $selector . ' .uplifters-site-builder-blocks-team-member__image-wrap{width:' . $v['image_width'] . 'px;height:' . $v['image_height'] . 'px}';
  $css .= $selector . ' .uplifters-site-builder-blocks-team-member__name{font-family:' . $v['name_font_family'] . ';font-size:' . $v['name_font_size'] . 'px;color:' . $v['name_color'] . '}';
  $css .= $selector . ' .uplifters-site-builder-blocks-team-member__designation{font-family:' . $v['designation_font_family'] . ';font-size:' . $v['designation_font_size'] . 'px;color:' . $v['designation_color'] . '}';
  $css .= $selector . ' .uplifters-site-builder-blocks-team-member__content{background-color:' . $v['content_background_color'] . '}';
  return $css;
};
$uplifters_site_builder_blocks_dynamic_css = $uplifters_site_builder_blocks_build_css( '#' . $uplifters_site_builder_blocks_unique_id, $uplifters_site_builder_blocks_devices['desktop'] );
$uplifters_site_builder_blocks_dynamic_css .= '@media(max-width:1024px){' . $uplifters_site_builder_blocks_build_css( '#' . $uplifters_site_builder_blocks_unique_id, $uplifters_site_builder_blocks_devices['tablet'] ) . '}';
$uplifters_site_builder_blocks_dynamic_css .= '@media(max-width:767px){' . $uplifters_site_builder_blocks_build_css( '#' . $uplifters_site_builder_blocks_unique_id, $uplifters_site_builder_blocks_devices['mobile'] ) . '}';
?>
<?php
$uplifters_site_builder_blocks_css = wp_strip_all_tags( $uplifters_site_builder_blocks_static_css . $uplifters_site_builder_blocks_dynamic_css );
\UpliftersSiteBuilderBlocks\BlocksRoute\BlocksDynamicStyleGenerator::enqueue( $block, $uplifters_site_builder_blocks_css );
?>
<div <?php
	// get_block_wrapper_attributes() already escapes every value with
	// esc_attr() before returning. wp_kses() with an empty allowlist
	// leaves that string unchanged and satisfies static analysis.
	echo wp_kses( $uplifters_site_builder_blocks_wrapper_attributes, array() );
?>>
  <div class="uplifters-site-builder-blocks-team-member__grid">
    <?php foreach ( $uplifters_site_builder_blocks_cards as $uplifters_site_builder_blocks_card ) :
      $uplifters_site_builder_blocks_image_url = esc_url( $uplifters_site_builder_blocks_card['imageUrl'] ?? '' );
      $uplifters_site_builder_blocks_image_alt = esc_attr( $uplifters_site_builder_blocks_card['imageAlt'] ?? '' );
      $uplifters_site_builder_blocks_name = wp_kses_post( $uplifters_site_builder_blocks_card['name'] ?? '' );
      $uplifters_site_builder_blocks_designation = wp_kses_post( $uplifters_site_builder_blocks_card['designation'] ?? '' );
      $uplifters_site_builder_blocks_card_content = wp_kses_post( $uplifters_site_builder_blocks_card['content'] ?? '' );
    ?>
      <article class="uplifters-site-builder-blocks-team-member__card">
        <div class="uplifters-site-builder-blocks-team-member__image-wrap">
          <?php if ( $uplifters_site_builder_blocks_image_url ) : ?><img class="uplifters-site-builder-blocks-team-member__image" src="<?php echo esc_url( $uplifters_site_builder_blocks_image_url ); ?>" alt="<?php echo esc_attr( $uplifters_site_builder_blocks_image_alt ); ?>" loading="lazy" /><?php else : ?><span class="uplifters-site-builder-blocks-team-member__image-placeholder"><?php echo esc_html__( 'No Image', 'uplifters-site-builder-blocks' ); ?></span><?php endif; ?>
        </div>
        <h3 class="uplifters-site-builder-blocks-team-member__name"><?php echo wp_kses_post( $uplifters_site_builder_blocks_name ); ?></h3>
        <p class="uplifters-site-builder-blocks-team-member__designation"><?php echo wp_kses_post( $uplifters_site_builder_blocks_designation ); ?></p>
        <div class="uplifters-site-builder-blocks-team-member__content"><?php echo wp_kses_post( $uplifters_site_builder_blocks_card_content ); ?></div>
      </article>
    <?php endforeach; ?>
  </div>
</div>
