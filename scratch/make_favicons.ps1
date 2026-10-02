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

function Build-BadgeBitmap($size) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $margin = [math]::Max(2, [int]($size * 0.03))
    $rect = New-Object System.Drawing.Rectangle $margin, $margin, ($size - 2 * $margin), ($size - 2 * $margin)
    $radius = [int]($size * 0.22)
    $path = Create-RoundedRectanglePath $rect $radius

    $p1 = New-Object System.Drawing.Point 0, 0
    $p2 = New-Object System.Drawing.Point 0, $size
    $c1 = [System.Drawing.Color]::FromArgb(255, 24, 38, 35)
    $c2 = [System.Drawing.Color]::FromArgb(255, 12, 20, 18)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $p1, $p2, $c1, $c2
    $g.FillPath($brush, $path)

    $penWidth = [math]::Max(1.5, $size * 0.016)
    $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(200, 20, 184, 166)), $penWidth
    $g.DrawPath($pen, $path)

    $logoW = [int]($size * 0.88)
    $logoH = [int]($logoW * $logoWhite.Height / $logoWhite.Width)
    $logoX = [int](($size - $logoW) / 2)
    $logoY = [int](($size - $logoH) / 2)

    $g.DrawImage($logoWhite, $logoX, $logoY, $logoW, $logoH)

    $pen.Dispose()
    $brush.Dispose()
    $g.Dispose()
    return $bmp
}

# 1. Generate 512x512 Master for icon.png
$bmp512 = Build-BadgeBitmap 512
$bmp512.Save("public\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp512.Save("app\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Saved public/icon.png and app/icon.png (512x512)"

# 2. Generate multi-resolution ICO for favicon.ico
# To create clean .ico file from bitmap:
$bmp256 = Build-BadgeBitmap 256
$hIcon = $bmp256.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fileStreamPublic = [System.IO.File]::Open("public\favicon.ico", [System.IO.FileMode]::Create)
$icon.Save($fileStreamPublic)
$fileStreamPublic.Close()

$fileStreamApp = [System.IO.File]::Open("app\favicon.ico", [System.IO.FileMode]::Create)
$icon.Save($fileStreamApp)
$fileStreamApp.Close()

$bmp512.Dispose()
$bmp256.Dispose()
$logoWhite.Dispose()
Write-Output "Successfully updated icon.png and favicon.ico in both public and app!"
