Add-Type -AssemblyName System.Drawing

$whitePath = (Resolve-Path "public\logo-white.png").Path
$logoWhite = [System.Drawing.Image]::FromFile($whitePath)

function Create-RoundedRectanglePath($rect, $radius) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $diameter = $radius * 2
    $arc = New-Object System.Drawing.Rectangle $rect.X, $rect.Y, $diameter, $diameter

    $path.AddArc($arc, 180, 90)
    $arc.X = $rect.Right - $diameter
    $path.AddArc($arc, 270, 90)
    $arc.Y = $rect.Bottom - $diameter
    $path.AddArc($arc, 0, 90)
    $arc.X = $rect.X
    $path.AddArc($arc, 90, 90)
    $path.CloseFigure()
    return $path
}

function Build-Badge($size, $logoWidthRatio, $radiusRatio, $outPath) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $margin = [math]::Max(2, [int]($size * 0.03))
    $rect = New-Object System.Drawing.Rectangle $margin, $margin, ($size - 2 * $margin), ($size - 2 * $margin)
    $radius = [int]($size * $radiusRatio)
    $path = Create-RoundedRectanglePath $rect $radius

    $p1 = New-Object System.Drawing.Point 0, 0
    $p2 = New-Object System.Drawing.Point 0, $size
    $c1 = [System.Drawing.Color]::FromArgb(255, 24, 38, 35)
    $c2 = [System.Drawing.Color]::FromArgb(255, 12, 20, 18)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $p1, $p2, $c1, $c2
    $g.FillPath($brush, $path)

    $penWidth = [math]::Max(1.5, $size * 0.016)
    $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(180, 20, 184, 166)), $penWidth
    $g.DrawPath($pen, $path)

    $logoW = [int]($size * $logoWidthRatio)
    $logoH = [int]($logoW * $logoWhite.Height / $logoWhite.Width)
    $logoX = [int](($size - $logoW) / 2)
    $logoY = [int](($size - $logoH) / 2)

    $g.DrawImage($logoWhite, $logoX, $logoY, $logoW, $logoH)

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $pen.Dispose()
    $brush.Dispose()
    $g.Dispose()
    $bmp.Dispose()
}

# Generate 256x256 master
Build-Badge 256 0.88 0.22 "scratch\opt_badge_large.png"

# Also generate transparent with crisp white and dark drop-shadow
$bmpTrans = New-Object System.Drawing.Bitmap 256, 256
$gT = [System.Drawing.Graphics]::FromImage($bmpTrans)
$gT.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gT.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$wT = [int](256 * 0.94)
$hT = [int]($wT * $logoWhite.Height / $logoWhite.Width)
$xT = [int]((256 - $wT) / 2)
$yT = [int]((256 - $hT) / 2)
# Draw dark logo as solid silhouette for tab bars
$darkPath = (Resolve-Path "public\logo-dark.png").Path
$logoDark = [System.Drawing.Image]::FromFile($darkPath)
$gT.DrawImage($logoDark, $xT, $yT, $wT, $hT)
$bmpTrans.Save("scratch\opt_trans_dark.png", [System.Drawing.Imaging.ImageFormat]::Png)
$gT.Dispose()
$bmpTrans.Dispose()
$logoDark.Dispose()

$logoWhite.Dispose()
Write-Output "Done generating sizes"
