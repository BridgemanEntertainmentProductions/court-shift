<?php
/**
 * Plugin Name: Court Shift – spelruta
 * Description: En liten ruta nere till vänster där besökare kan spela Court Shift: Duel direkt på sidan. Kortkod för en inbäddad ruta: [court_shift].
 * Version: 1.0.0
 * Author: Bridgeman Entertainment
 * License: MIT
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'CSB_GAME_URL', 'https://bridgemanentertainmentproductions.github.io/court-shift/' );
define( 'CSB_ITCH_URL', 'https://bridgemanentertainment.itch.io/court-shift' );

function csb_texts() {
	$sv = 0 !== strpos( get_locale(), 'en' );
	return $sv ? array(
		'kicker' => 'Spel',
		'title'  => 'Åklagare eller försvarare?',
		'line'   => 'Spela Court Shift, ett kortspel i rättssalen.',
		'play'   => 'Spela nu',
		'close'  => 'Stäng',
		'hide'   => 'Dölj',
		'rate'   => 'Gillar du spelet? Betygsätt det på itch.io',
		'card'   => 'Ett kortspel byggt på svensk straffprocess. Åklagaren måste bevisa alla tre rekvisit, försvaret räcker att vinna ett. Och efter lunch kanske ni byter sida.',
	) : array(
		'kicker' => 'Game',
		'title'  => 'Prosecutor or defense?',
		'line'   => 'Play Court Shift, a courtroom card duel.',
		'play'   => 'Play now',
		'close'  => 'Close',
		'hide'   => 'Hide',
		'rate'   => 'Enjoyed it? Rate it on itch.io',
		'card'   => 'A card game built on Swedish criminal procedure. The prosecution must prove all three elements, the defense only needs one. And after lunch you may switch sides.',
	);
}

function csb_assets() {
	static $done = false;
	if ( $done ) {
		return;
	}
	$done = true;
	$t    = csb_texts();
	$coin = esc_url( plugins_url( 'assets/coin.png', __FILE__ ) );
	?>
<style id="court-shift-box-css">
.csb-dock{position:fixed;left:16px;bottom:72px;z-index:9989;display:flex;align-items:center;gap:10px;background:#fff;border-radius:18px;padding:9px 12px 9px 9px;box-shadow:0 8px 28px rgba(16,32,64,.18);cursor:pointer;max-width:300px;font-family:inherit;transition:transform .2s,box-shadow .2s;border:0;text-align:left}
.csb-dock:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(16,32,64,.24)}
.csb-dock img{width:52px;height:52px;flex:none;animation:csb-flip 6s ease-in-out infinite}
@keyframes csb-flip{0%,80%,100%{transform:rotateY(0)}88%{transform:rotateY(180deg)}}
.csb-dock .csb-k{display:block;font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#1d4e89}
.csb-dock .csb-t{display:block;font-size:14px;font-weight:600;color:#14213d;line-height:1.3}
.csb-dock .csb-x{position:absolute;top:-8px;right:-8px;width:22px;height:22px;border-radius:50%;background:#14213d;color:#fff;font-size:13px;line-height:22px;text-align:center;border:0;cursor:pointer;padding:0;opacity:0;transition:opacity .2s}
.csb-dock:hover .csb-x,.csb-dock:focus-within .csb-x{opacity:1}
.csb-ov{position:fixed;inset:0;z-index:999990;background:rgba(10,14,28,.82);display:none;align-items:center;justify-content:center;padding:2vh 2vw}
.csb-ov.is-open{display:flex}
.csb-frame{position:relative;width:min(1280px,96vw);height:min(820px,92vh);background:#120a06;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5);display:flex;flex-direction:column}
.csb-frame iframe{flex:1;width:100%;border:0}
.csb-bar{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:7px 10px 7px 14px;background:#14213d;color:#fff;font-size:13px}
.csb-bar a{color:#ffd23f;text-decoration:underline}
.csb-bar button{background:#ffd23f;color:#14213d;border:0;border-radius:8px;font-weight:700;padding:6px 12px;cursor:pointer}
.csb-card{display:flex;gap:18px;align-items:center;background:linear-gradient(120deg,#fff7e6,#ffe3b3);border-radius:18px;padding:18px;margin:10px 0}
.csb-card img{width:96px;height:96px;flex:none}
.csb-card h3{margin:0 0 4px;font-size:20px;color:#14213d}
.csb-card p{margin:0 0 10px;color:#14213d}
.csb-card .csb-play{background:#14213d;color:#fff;border:0;border-radius:10px;padding:10px 18px;font-weight:700;cursor:pointer}
@media (max-width:767px){
 .csb-dock{bottom:70px;left:12px;padding:6px;border-radius:50%}
 .csb-dock .csb-txt{display:none}
 .csb-dock img{width:46px;height:46px}
 .csb-frame{width:100vw;height:100%;border-radius:0}
 .csb-ov{padding:0}
 .csb-card{flex-direction:column;text-align:center}
}
@media (prefers-reduced-motion:reduce){.csb-dock img{animation:none}}
</style>
<div class="csb-ov" id="csb-ov" role="dialog" aria-modal="true" aria-label="Court Shift">
	<div class="csb-frame">
		<div class="csb-bar notranslate"><a href="<?php echo esc_url( CSB_ITCH_URL ); ?>" target="_blank" rel="noopener"><?php echo esc_html( $t['rate'] ); ?></a><button type="button" id="csb-close"><?php echo esc_html( $t['close'] ); ?> ✕</button></div>
	</div>
</div>
<script id="court-shift-box-js">
(function(){
	var ov=document.getElementById('csb-ov'),fr=ov.querySelector('.csb-frame');
	function open(){
		if(!fr.querySelector('iframe')){
			var f=document.createElement('iframe');
			f.src=<?php echo wp_json_encode( CSB_GAME_URL ); ?>;
			f.title='Court Shift: Duel';
			f.allow='autoplay; fullscreen';
			f.setAttribute('allowfullscreen','');
			fr.appendChild(f);
		}
		ov.classList.add('is-open');document.documentElement.style.overflow='hidden';
	}
	function close(){ov.classList.remove('is-open');document.documentElement.style.overflow='';}
	document.getElementById('csb-close').addEventListener('click',close);
	ov.addEventListener('click',function(e){if(e.target===ov)close();});
	document.addEventListener('keydown',function(e){if(e.key==='Escape')close();if(e.key==='Enter'&&e.target.matches&&e.target.matches('[data-csb-open]'))open();});
	document.addEventListener('click',function(e){var b=e.target.closest('[data-csb-open]');if(b){e.preventDefault();open();}});
	window.csbOpen=open;
	var d=document.getElementById('csb-dock');
	if(d){
		var hid=0;try{hid=+localStorage.getItem('csb-hidden')||0}catch(e){}
		if(Date.now()-hid<7*864e5){d.remove();return;}
		d.querySelector('.csb-x').addEventListener('click',function(e){e.stopPropagation();try{localStorage.setItem('csb-hidden',Date.now())}catch(_){}d.remove();});
	}
})();
</script>
	<?php
}

add_action( 'wp_footer', function () {
	if ( is_admin() ) {
		return;
	}
	$t    = csb_texts();
	$coin = esc_url( plugins_url( 'assets/coin.png', __FILE__ ) );
	echo '<div class="csb-dock" id="csb-dock" data-csb-open role="button" tabindex="0" aria-label="' . esc_attr( $t['line'] ) . '">'
		. '<img src="' . $coin . '" alt="" width="52" height="52">'
		. '<span class="csb-txt"><span class="csb-k">' . esc_html( $t['kicker'] ) . ' · <span class="notranslate">Court Shift</span></span><span class="csb-t">' . esc_html( $t['title'] ) . '</span></span>'
		. '<button type="button" class="csb-x" aria-label="' . esc_attr( $t['hide'] ) . '">✕</button></div>';
	csb_assets();
}, 20 );

add_shortcode( 'court_shift', function () {
	$t    = csb_texts();
	$coin = esc_url( plugins_url( 'assets/coin.png', __FILE__ ) );
	add_action( 'wp_footer', 'csb_assets', 21 );
	return '<div class="csb-card"><img src="' . $coin . '" alt="" width="96" height="96"><div><h3 class="notranslate">Court Shift: Duel</h3><p>' . esc_html( $t['card'] ) . '</p><button type="button" class="csb-play" data-csb-open>' . esc_html( $t['play'] ) . ' ▶</button></div></div>';
} );
