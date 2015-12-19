<?php
putenv('GDFONTPATH=' . realpath('.'));
$err = false;
if(isset($_GET['text']) && $_GET['text']!='') {
  $text = $_GET['text'];
} else {
  $err = true;
  echo 'Error: \'text\' parameter in URL not set.';
}

if(!$err) {

  $messageString = $text
  $text_width = abs(imagettfbbox(12, 0, 'arial', $messageString)[4] - imagettfbbox(12, 0, 'arial', $messageString)[0]);
  $text_height = abs(imagettfbbox(12, 0, 'arial', $messageString)[5] - imagettfbbox(12, 0, 'arial', $messageString)[1]);
  $img = imagecreatetruecolor(1+$text_width, $text_height);
  $text_colour = imagecolorallocate($img, 0, 0, 0);
  if(isset($_GET['color'])) {
    $col = '#' . $_GET['color'];
    list($r, $g, $b) = sscanf($col, "#%02x%02x%02x");
    $text_colour = imagecolorallocate($img, $r, $g, $b);
  }
  $background = imagecolorallocate($img, 255, 255, 255);
  if(isset($_GET['bgcolor'])) {
    $col = '#' . $_GET['bgcolor'];
    list($r, $g, $b) = sscanf($col, "#%02x%02x%02x");
    $background = imagecolorallocate($img, $r, $g, $b);
  }
  imagefill($img, 0, 0, $background);
  imagettftext($img, 12, 0, 1, $text_height, $text_colour, 'arial', $messageString);
  header( "Content-type: image/png" );
  imagepng($img);
  imagecolordeallocate($line_color);
  imagecolordeallocate($text_color);
  imagecolordeallocate($background);
  imagedestroy($img);
}
?>
